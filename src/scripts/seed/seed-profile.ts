import { json } from "~/database/fixtures";
import { type Transaction } from "~/database/prisma";
import { type cli } from "~/scripts";
import { stdout } from "~/support";

export async function seedProfile(tx: Transaction, ctx: cli.ScriptContext) {
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
