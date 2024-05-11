import { type ApiCourse } from "~/prisma/model";

import { Select, type SelectProps } from "./generic";

const globalOptions = {
  isNullable: false,
  getModelValue: (m: ApiCourse) => m.id,
  getModelLabel: (m: ApiCourse) => m.shortName ?? m.name,
  getModelValueLabel: (m: ApiCourse) => m.shortName ?? m.name,
} as const;

type Opts<O extends { isMulti?: boolean }> = typeof globalOptions & { isMulti: O["isMulti"] };

export interface CourseSelectProps<O extends { isMulti?: boolean }>
  extends Omit<SelectProps<string, ApiCourse, Opts<O>>, "options" | "itemRenderer"> {
  readonly options: O;
}

export const CourseSelect = <O extends { isMulti?: boolean }>({
  options,
  ...props
}: CourseSelectProps<O>): JSX.Element => (
  <Select<string, ApiCourse, Opts<O>>
    {...props}
    options={{ ...globalOptions, isMulti: options.isMulti }}
  />
);
