import { type BrandModel } from "./brand";
import { Degree } from "./core";
import { type ApiDetail } from "./details";
import { type ConditionallyInclude } from "./inclusion";
import { type ApiSkill } from "./skills";

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

export type EduIncludes =
  | ["skills", "details"]
  | ["details", "skills"]
  | ["skills"]
  | ["details"]
  | [];

export type ApiEducation<I extends EduIncludes = []> = ConditionallyInclude<
  BrandModel<"education"> & {
    readonly details: ApiDetail<["nestedDetails", "skills"]>[];
    readonly skills: Omit<ApiSkill, "autoExperience">[];
  },
  ["skills", "details"],
  I
>;
