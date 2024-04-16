import { type Project } from "~/prisma/model";
import { Text } from "~/components/typography/Text";

import { Select, type SelectProps } from "./generic";

const globalOptions = {
  isNullable: true,
  getModelValue: (m: Project) => m.id,
  getModelLabel: (m: Project) => m.name,
  getModelValueLabel: (m: Project) => m.shortName ?? m.name,
} as const;

export interface ProjectSelectProps<O extends { isMulti?: boolean }>
  extends Omit<SelectProps<Project, typeof globalOptions & O>, "options" | "itemRenderer"> {
  readonly options: O;
}

export const ProjectSelect = <O extends { isMulti?: boolean }>({
  options,
  ...props
}: ProjectSelectProps<O>): JSX.Element => (
  <Select<Project, typeof options & O>
    {...props}
    options={{ ...globalOptions, ...options }}
    itemRenderer={m => (
      <div className="flex flex-col gap-[4px]">
        <Text size="sm" fontWeight="medium">
          {m.name}
        </Text>
        <Text size="xs" className="text-body-light">
          {m.slug}
        </Text>
      </div>
    )}
  />
);
