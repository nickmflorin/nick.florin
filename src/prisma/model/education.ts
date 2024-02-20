import { type Education, type School, Degree } from "@prisma/client";

import { type prisma } from "../client";

export type DegreeData = {
  readonly label: string;
  readonly abbreviatedLabel: string;
};

export const DegreeDatas: { [key in Degree]: DegreeData } = {
  [Degree.BACHELORS_OF_SCIENCE]: { abbreviatedLabel: "B.S.", label: "Bachelor of Science" },
  [Degree.MASTERS_OF_SCIENCE]: { abbreviatedLabel: "M.S.", label: "Master of Science" },
  [Degree.MASTERS_OF_SCIENCE_IN_ENGINEERING]: {
    abbreviatedLabel: "M.S in Engineering",
    label: "Master of Science in Engineering",
  },
};

export const getDegreeData = (degree: Degree): DegreeData => DegreeDatas[degree];

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
