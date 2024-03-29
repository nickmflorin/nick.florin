import { prisma } from "../../client";
import { type Profile } from "../../model";
import { json } from "../fixtures/json";

import { type SeedContext } from "./types";

export async function seedProfile(ctx: SeedContext) {
  const profiles = await prisma.profile.findMany({ orderBy: { createdAt: "desc" }, take: 1 });
  let profile: Profile | null = null;
  if (profiles.length > 0) {
    profile = profiles[0];
  }
  if (!profile) {
    await prisma.profile.create({
      data: {
        ...json.profile,
        updatedById: ctx.user.id,
        createdById: ctx.user.id,
      },
    });
    /* eslint-disable-next-line no-console */
    console.info("Created New Profile");
  } else {
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        ...json.profile,
        updatedById: ctx.user.id,
      },
    });
    /* eslint-disable-next-line no-console */
    console.info("Updated Profile");
  }
}
