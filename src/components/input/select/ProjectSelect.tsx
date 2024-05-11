import type { IconName } from "@fortawesome/fontawesome-svg-core";

import { type BrandProject } from "~/prisma/model";
import type { IconProp } from "~/components/icons";
import { Text } from "~/components/typography/Text";

import { Select, type SelectProps } from "./generic";

type Proj = Omit<BrandProject, "icon"> & { readonly icon: IconProp };

const globalOptions = {
  isNullable: true,
  getModelValue: (m: Proj) => m.id,
  getModelLabel: (m: Proj) => m.name,
  getModelValueLabel: (m: Proj) => m.shortName ?? m.name,
} as const;

export interface ProjectSelectProps<O extends { isMulti?: boolean }>
  extends Omit<
    SelectProps<string, Proj, typeof globalOptions & O>,
    "options" | "itemRenderer" | "data"
  > {
  readonly data: BrandProject[];
  readonly options: O;
}

export const ProjectSelect = <O extends { isMulti?: boolean }>({
  options,
  ...props
}: ProjectSelectProps<O>): JSX.Element => (
  <Select<string, Proj, typeof options & O>
    {...props}
    options={{ ...globalOptions, ...options }}
    /* TODO: We eventually may want to solidify types related to the available IconName(s) so we can
       use it for schema validation of data coming from the database. */
    data={props.data.map(datum => ({ ...datum, icon: { name: datum.icon as IconName } }))}
    itemRenderer={m => (
      <div className="flex flex-col gap-[4px]">
        <Text fontSize="sm" fontWeight="medium" truncate>
          {m.name}
        </Text>
        <Text fontSize="xs" className="text-description">
          {m.slug}
        </Text>
      </div>
    )}
  />
);
