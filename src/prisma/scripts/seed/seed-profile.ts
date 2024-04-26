import { type Transaction } from "~/prisma/client";

import { json } from "../fixtures/json";
import { stdout } from "../stdout";

import { type SeedContext } from "./types";

export async function seedProfile(tx: Transaction, ctx: SeedContext) {
  stdout.begin(`Seeding ${json.profiles.length} Profiles...`);

  const profiles = await tx.profile.createMany({
    data: json.profiles.map(profile => ({
      ...profile,
      updatedById: ctx.user.id,
      createdById: ctx.user.id,
    })),
  });
  stdout.complete(`Successfully Seeded ${profiles.count} Profiles`);
}
