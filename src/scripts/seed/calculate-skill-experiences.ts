import { calculateSkillsExperience } from "~/database/model";
import { type Transaction } from "~/database/prisma";
import { type SeedContext } from "~/scripts/context";
import { stdout } from "~/support";

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
