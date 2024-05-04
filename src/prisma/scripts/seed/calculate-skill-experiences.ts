import { type Transaction } from "~/prisma/client";
import { calculateSkillsExperience } from "~/prisma/model";

import { stdout } from "../stdout";

import { type SeedContext } from "./types";

export async function calculateSkillExperiences(tx: Transaction, ctx: SeedContext) {
  const skills = await tx.skill.findMany({});
  if (skills.length !== 0) {
    stdout.begin(`Calculating experience for ${skills.length} skills...`);
    await calculateSkillsExperience(
      tx,
      skills.map(sk => sk.id),
      { persist: true, user: ctx.user },
    );
    stdout.complete(`Calculated experience for ${skills.length} skills...`);
  }
}
