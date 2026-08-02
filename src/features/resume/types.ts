import {
  type ApiEducation,
  type ApiExperience,
  type BrandModel,
  type ResumeBrand,
} from '~/database/model';

export type ResumeModelSize = 'large' | 'medium' | 'small';

export type ApiModel<T extends ResumeBrand> = {
  education: ApiEducation<['details', 'skills', 'courses']>;
  experience: ApiExperience<['details', 'skills']>;
}[T];

const isNonEmpty = (v: null | string) => typeof v === 'string' && v.trim().length !== 0;

export const hasDescription = <M extends BrandModel<T>, T extends ResumeBrand>(
  model: M,
): boolean => {
  if (model.$kind === 'education') {
    return isNonEmpty(model.note) || isNonEmpty(model.description);
  }
  return isNonEmpty(model.description);
};
