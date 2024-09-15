import { type ApiCourse } from "~/prisma/model";

import { Select, type SelectProps } from "~/components/input/select";

const globalOptions = {
  isDeselectable: true,
  getModelValue: (m: ApiCourse) => m.id,
  getModelLabel: (m: ApiCourse) => m.shortName ?? m.name,
  getModelValueLabel: (m: ApiCourse) => m.shortName ?? m.name,
} as const;

type Opts<O extends { isMulti?: boolean; isClearable?: boolean }> = typeof globalOptions & {
  isMulti: O["isMulti"];
  isClearable: O["isClearable"];
};

export interface CourseSelectProps<O extends { isMulti?: boolean; isClearable?: boolean }>
  extends Omit<SelectProps<string, ApiCourse, Opts<O>>, "options" | "itemRenderer"> {
  readonly options: O;
}

export const CourseSelect = <O extends { isMulti?: boolean; isClearable?: boolean }>({
  options,
  ...props
}: CourseSelectProps<O>): JSX.Element => (
  <Select<string, ApiCourse, Opts<O>>
    {...props}
    options={{ ...globalOptions, isMulti: options.isMulti, isClearable: options.isClearable }}
  />
);
