import {
  type DetailEntityType,
  type Experience,
  type Education,
  type Detail,
  type NestedDetail,
  type Project,
} from "./core";

export type DetailEntity<T extends DetailEntityType> = {
  readonly [DetailEntityType.EXPERIENCE]: Experience;
  readonly [DetailEntityType.EDUCATION]: Education;
}[T];

export type NestedApiDetail = NestedDetail & {
  readonly project: Project | null;
};

export type ApiDetail = Detail & {
  readonly project: Project | null;
};

export type FullApiDetail = ApiDetail & {
  readonly nestedDetails: NestedApiDetail[];
};

export const isFullDetail = (detail: FullApiDetail | NestedApiDetail): detail is FullApiDetail =>
  (detail as FullApiDetail).nestedDetails !== undefined;
