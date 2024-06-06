import { prisma, type Transaction } from "~/prisma/client";
import type { User } from "~/prisma/model";
import { environment } from "~/environment";

import * as types from "./types";

interface SyncRepositoriesParams {
  readonly user: User;
  readonly tx?: Transaction;
}

type TransactionCallback<T> = (tx: Transaction) => Promise<T>;

async function withinTransaction<T>(fn: TransactionCallback<T>): Promise<T>;

async function withinTransaction<T>(
  tx: Transaction | undefined,
  fn: TransactionCallback<T>,
): Promise<T>;

async function withinTransaction<T>(
  tx: Transaction | undefined | TransactionCallback<T>,
  fn?: TransactionCallback<T>,
): Promise<T> {
  if (typeof tx === "function") {
    return await prisma.$transaction(async t => tx(t));
  } else if (fn !== undefined && tx !== undefined) {
    return fn(tx);
  }
  throw new Error("Invalid method implementation!");
}

export class GithubClient<U extends string> {
  private readonly username: U;

  constructor(username: U) {
    this.username = username;
  }

  async fetchRepositories(): Promise<types.GithubRepo<U>[]> {
    const url = `${types.GITHUB_BASE_URL}/users/${this.username}/repos`;
    const response = await fetch(url);
    return await response.json();
  }

  async syncRepositories({ tx: _tx, user }: SyncRepositoriesParams): Promise<void> {
    const githubRepos = await this.fetchRepositories();

    withinTransaction(_tx, async tx => {
      for (const repo of githubRepos) {
        const existing = await tx.repository.findUnique({ where: { slug: repo.name } });
        if (existing) {
          if (existing.description === undefined || existing.startDate === undefined) {
            await tx.repository.update({
              where: { id: existing.id },
              data: {
                description: existing.description ?? repo.description,
                startDate: existing.startDate ?? new Date(repo.created_at),
                createdBy: { connect: { id: user.id } },
                updatedBy: { connect: { id: user.id } },
              },
            });
          }
        } else {
          await tx.repository.create({
            data: {
              slug: repo.name,
              description: repo.description,
              startDate: new Date(repo.created_at),
              createdBy: { connect: { id: user.id } },
              updatedBy: { connect: { id: user.id } },
              visible: false,
              highlighted: false,
            },
          });
        }
      }
    });
  }
}

const username = environment.get("GITHUB_USERNAME");
export const githubClient = new GithubClient(username);
