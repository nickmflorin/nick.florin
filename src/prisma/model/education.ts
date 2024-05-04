import { type BrandModel } from "./brand";
import { type ApiCourse } from "./course";
import { type ApiDetail } from "./details";
import { Degree } from "./generated";
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

export type EducationIncludes =
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

export type EducationToCourseIncludes<I extends EducationIncludes> = I extends [
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  ...infer L extends string[],
  "skills",
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  ...infer R extends string[],
]
  ? ["skills"]
  : [];

export type EducationToDetailIncludes<I extends EducationIncludes> = I extends [
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  ...infer L extends string[],
  "skills",
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  ...infer R extends string[],
]
  ? ["nestedDetails", "skills"]
  : ["nestedDetails"];

export type ApiEducation<I extends EducationIncludes = []> = ConditionallyInclude<
  BrandModel<"education"> & {
    readonly details: ApiDetail<EducationToDetailIncludes<I>>[];
    readonly skills: ApiSkill[];
    /* Note: We do not need to worry about skills that are nested under the courses because we
       never show the skills associated with a course unless it is a detail view of the course. */
    readonly courses: ApiCourse<EducationToCourseIncludes<I>>[];
  },
  ["skills", "details", "courses"],
  I
>;
