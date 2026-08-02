import { type User } from '~/database/model';
import { type Transaction } from '~/database/prisma';

import { environment } from '~/environment';

import * as types from './types';

interface SyncRepositoriesParams {
  readonly tx: Transaction;
  readonly user: User;
}

export class GithubClient<U extends string> {
  private readonly username: U;

  constructor(username: U) {
    this.username = username;
  }

  async fetchRepositories(): Promise<types.GithubRepo<U>[]> {
    const url = `${types.GITHUB_BASE_URL}/users/${this.username}/repos`;
    const response = await fetch(url);
    const data: unknown = await response.json();
    /* The GitHub API's response body is not validated against the model that describes it, so the
       shape of the response is asserted rather than narrowed. */
    return data as types.GithubRepo<U>[];
  }

  async syncRepositories({ tx, user }: SyncRepositoriesParams): Promise<void> {
    const githubRepos = await this.fetchRepositories();
    for (const repo of githubRepos) {
      /* eslint-disable-next-line no-await-in-loop -- The queries are issued sequentially, in
         order, against a shared transaction client. */
      const existing = await tx.repository.findUnique({ where: { slug: repo.name } });
      if (!existing) {
        /* eslint-disable-next-line no-await-in-loop -- The queries are issued sequentially, in
           order, against a shared transaction client. */
        await tx.repository.create({
          data: {
            createdBy: { connect: { id: user.id } },
            description: repo.description,
            highlighted: false,
            slug: repo.name,
            startDate: new Date(repo.created_at),
            updatedBy: { connect: { id: user.id } },
            visible: false,
          },
        });
      }
    }
  }
}

const username = environment.get('GITHUB_USERNAME');
export const githubClient = new GithubClient(username);
