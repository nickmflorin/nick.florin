import { type Transaction } from "~/prisma/client";

import { json } from "../fixtures/json";
import { stdout } from "../stdout";

import { type SeedContext } from "./types";

export async function seedRepositories(tx: Transaction, ctx: SeedContext) {
  if (json.schools.length !== 0) {
    const output = stdout.begin(`Generating ${json.repositories.length} Repositories...`);
    const repositories = await Promise.all(
      json.repositories.map(jsonRepo =>
        tx.repository.create({
          data: {
            ...jsonRepo,
            createdBy: { connect: { id: ctx.user.id } },
            updatedBy: { connect: { id: ctx.user.id } },
            skills: { connect: jsonRepo.skills.map(skill => ({ slug: skill })) },
          },
        }),
      ),
    );
    output.complete(`Generated ${repositories.length} Repositories`, {
      lineItems: repositories.map(s => s.slug),
    });
  }
}
