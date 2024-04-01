import { type prisma } from "../client";

import { type Experience, type Company } from "./core";
import { type ConditionallyIncluded } from "./inclusion";

export type ExpIncludes = Partial<{
  readonly skills: boolean;
  readonly details: boolean;
}>;

type ExpSkills = Awaited<
  ReturnType<typeof prisma.skill.findMany<{ include: { experiences: true } }>>
>;

export type ExpSkill = ExpSkills[number];

type ExpDetails = Awaited<
  ReturnType<typeof prisma.detail.findMany<{ include: { nestedDetails: true; project: true } }>>
>;

export type ExpDetail = ExpDetails[number];

type _BaseApiExperience = Experience & { readonly company: Company };

export type ApiExperience<I extends ExpIncludes = { skills: false; details: false }> =
  ConditionallyIncluded<
    _BaseApiExperience,
    {
      readonly details: ExpDetail[];
      readonly skills: ExpSkill[];
    },
    I
  >;
