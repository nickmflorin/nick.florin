import { type prisma } from "../client";

import { type Education, type School, Degree } from "./core";
import { type ConditionallyIncluded } from "./inclusion";

export const Degrees = {
  [Degree.BACHELORS_OF_SCIENCE]: { label: "Bachelors of Science", shortLabel: "B.S." },
  [Degree.MASTERS_OF_SCIENCE]: { label: "Masters of Science", shortLabel: "M.S." },
  [Degree.MASTERS_OF_SCIENCE_IN_ENGINEERING]: {
    label: "Masters of Science in Engineering",
    shortLabel: "M.S.E.",
  },
} satisfies { [key in Degree]: { label: string; shortLabel: string } };

export const getDegree = <D extends Degree>(degree: D): (typeof Degrees)[D] & { value: D } => ({
  ...Degrees[degree],
  value: degree,
});

export type EduIncludes = Partial<{
  readonly skills: boolean;
  readonly details: boolean;
}>;

type EduSkills = Awaited<
  ReturnType<typeof prisma.skill.findMany<{ include: { educations: true } }>>
>;

export type EduSkill = EduSkills[number];

type EduDetails = Awaited<
  ReturnType<typeof prisma.detail.findMany<{ include: { nestedDetails: true; project: true } }>>
>;

export type EduDetail = EduDetails[number];

type _BaseApiEducation = Education & { readonly school: School };

export type ApiEducation<I extends EduIncludes = { skills: false; details: false }> =
  ConditionallyIncluded<
    _BaseApiEducation,
    {
      readonly details: EduDetail[];
      readonly skills: EduSkill[];
    },
    I
  >;
