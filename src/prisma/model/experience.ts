import { type Experience, type Company } from "@prisma/client";

import { type prisma } from "../client";

export type ExpIncludes = {
  readonly skills?: boolean;
  readonly details?: boolean;
};

type ExpSkills = Awaited<
  ReturnType<typeof prisma.skill.findMany<{ include: { experiences: true } }>>
>;

export type ExpSkill = ExpSkills[number];

type ExpDetails = Awaited<
  ReturnType<typeof prisma.detail.findMany<{ include: { nestedDetails: true } }>>
>;

export type ExpDetail = ExpDetails[number];

export type ApiExperience<I extends ExpIncludes | undefined = undefined> = I extends {
  skills: true;
  details: true;
}
  ? Experience & {
      readonly company: Company;
      readonly details: ExpDetail[];
      readonly skills: ExpSkill[];
    }
  : I extends { skills: true }
    ? Experience & {
        readonly company: Company;
        readonly skills: ExpSkill[];
      }
    : I extends { details: true }
      ? Experience & {
          readonly company: Company;
          readonly details: ExpDetail[];
        }
      : Experience & { readonly company: Company };
