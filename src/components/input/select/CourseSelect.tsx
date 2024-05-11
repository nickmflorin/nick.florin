import { type ApiCourse } from "~/prisma/model";

import { Select, type SelectProps } from "./generic";

const globalOptions = {
  isNullable: false,
  getModelValue: (m: ApiCourse) => m.id,
  getModelLabel: (m: ApiCourse) => m.shortName ?? m.name,
  getModelValueLabel: (m: ApiCourse) => m.shortName ?? m.name,
} as const;

export interface CourseSelectProps<O extends { isMulti?: boolean }>
  extends Omit<
    SelectProps<string, ApiCourse, typeof globalOptions & O>,
    "options" | "itemRenderer"
  > {
  readonly options: O;
}

export const CourseSelect = <O extends { isMulti?: boolean }>({
  options,
  ...props
}: CourseSelectProps<O>): JSX.Element => (
  <Select<string, ApiCourse, typeof options & O>
    {...props}
    options={{ ...globalOptions, ...options }}
  />
);
