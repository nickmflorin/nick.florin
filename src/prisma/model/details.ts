import {
  type DetailEntityType,
  type Experience,
  type Education,
  type Detail,
  type NestedDetail,
} from "@prisma/client";

export type DetailEntity<T extends DetailEntityType> = {
  readonly [DetailEntityType.EXPERIENCE]: Experience;
  readonly [DetailEntityType.EDUCATION]: Education;
}[T];

export type FullDetail = Detail & {
  readonly nestedDetails: NestedDetail[];
};
