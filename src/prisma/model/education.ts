import { type Education, type School, Degree } from "@prisma/client";

import { type prisma } from "../client";

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

export type EduIncludes = {
  readonly skills?: boolean;
  readonly details?: boolean;
};

type EduSkills = Awaited<
  ReturnType<typeof prisma.skill.findMany<{ include: { educations: true } }>>
>;

export type EduSkill = EduSkills[number];

type EduDetails = Awaited<
  ReturnType<typeof prisma.detail.findMany<{ include: { nestedDetails: true } }>>
>;

export type EduDetail = EduDetails[number];

export type ApiEducation<I extends EduIncludes | undefined = undefined> = I extends {
  skills: true;
  details: true;
}
  ? Education & {
      readonly school: School;
      readonly details: EduDetail[];
      readonly skills: EduSkill[];
    }
  : I extends { skills: true }
    ? Education & {
        readonly school: School;
        readonly skills: EduSkill[];
      }
    : I extends { details: true }
      ? Education & {
          readonly school: School;
          readonly details: EduDetail[];
        }
      : Education & { readonly school: School };
