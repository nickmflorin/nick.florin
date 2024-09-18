import { stdout } from "~/application/support";
import { json } from "~/database/fixtures";
import { type Transaction } from "~/database/prisma";
import { type SeedContext } from "~/scripts/context";

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
