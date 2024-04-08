import { prisma } from "../../client";
import { json } from "../fixtures/json";

import { stdout } from "./stdout";
import { type SeedContext } from "./types";

export async function seedRepositories(ctx: SeedContext) {
  if (json.schools.length !== 0) {
    const output = stdout.begin(`Generating ${json.repositories.length} Repositories...`);
    const repositories = await Promise.all(
      json.repositories.map(jsonRepo =>
        prisma.repository.create({
          data: {
            ...jsonRepo,
            createdBy: { connect: { id: ctx.user.id } },
            updatedBy: { connect: { id: ctx.user.id } },
          },
        }),
      ),
    );
    output.complete(`Generated ${repositories.length} Repositories`, {
      lineItems: repositories.map(s => s.slug),
    });
  }
}
