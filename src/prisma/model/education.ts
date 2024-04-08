import { type BrandCourse, type BrandModel } from "./brand";
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
  | ["courses", "skills", "details"]
  | ["courses", "details", "skills"]
  | ["skills", "courses", "details"]
  | ["details", "courses", "skills"]
  | ["skills", "details", "courses"]
  | ["details", "skills", "courses"]
  | ["skills", "courses"]
  | ["courses", "skills"]
  | ["skills", "details"]
  | ["details", "skills"]
  | ["details", "courses"]
  | ["courses", "details"]
  | ["skills"]
  | ["details"]
  | ["courses"]
  | [];

export type ApiEducation<I extends EduIncludes = []> = ConditionallyInclude<
  BrandModel<"education"> & {
    readonly details: ApiDetail<["nestedDetails", "skills"]>[];
    readonly skills: Omit<ApiSkill, "autoExperience">[];
    /* TODO: We will have to create an ApiCourse to handle cases where the skills should be nested
       for each course. */
    readonly courses: BrandCourse[];
  },
  ["skills", "details", "courses"],
  I
>;
