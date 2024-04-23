import {
  type ApiEducation,
  type ApiExperience,
  type ResumeBrand,
  type BrandModel,
} from "~/prisma/model";

export type ResumeModelSize = "small" | "medium" | "large";

export const ImageSizes: { [key in ResumeModelSize]: number } = {
  small: 28,
  medium: 44,
  large: 72,
};

export type ApiModel<T extends ResumeBrand> = {
  education: ApiEducation<["details", "skills", "courses"]>;
  experience: ApiExperience<["details", "skills"]>;
}[T];

const isNonEmpty = (v: string | null) => typeof v === "string" && v.trim().length !== 0;

export const hasDescription = <M extends BrandModel<T>, T extends ResumeBrand>(
  model: M,
): boolean => {
  if (model.$kind === "education") {
    return isNonEmpty(model.note) || isNonEmpty(model.description);
  }
  return isNonEmpty(model.description);
};
