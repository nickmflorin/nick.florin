import { logger } from "~/internal/logger";
import { type BrandProject, ProjectSlugs } from "~/prisma/model";

import type { IconProp, IconName } from "~/components/icons";
import { Select, type SelectProps } from "~/components/input/select";
import { Text } from "~/components/typography";

type Proj = Omit<BrandProject, "icon"> & { readonly icon: IconProp };

const globalOptions = {
  getModelValue: (m: Proj) => m.id,
  getModelLabel: (m: Proj) => m.name,
  getModelValueLabel: (m: Proj) => m.shortName ?? m.name,
} as const;

type Opts<O extends { isMulti?: boolean; isClearable?: boolean; isDeselectable?: boolean }> =
  typeof globalOptions & {
    isMulti: O["isMulti"];
    isClearable: O["isClearable"];
    isDeselectable: O["isDeselectable"];
  };

export interface ProjectSelectProps<
  O extends { isMulti?: boolean; isClearable?: boolean; isDeselectable?: boolean },
> extends Omit<SelectProps<string, Proj, Opts<O>>, "options" | "itemRenderer" | "data"> {
  readonly data: BrandProject[];
  readonly options: O;
}

export const ProjectSelect = <
  O extends { isMulti?: boolean; isClearable?: boolean; isDeselectable?: boolean },
>({
  options,
  ...props
}: ProjectSelectProps<O>): JSX.Element => (
  <Select<string, Proj, Opts<O>>
    {...props}
    options={{
      ...globalOptions,
      isMulti: options.isMulti,
      isClearable: options.isClearable,
      isDeselectable: options.isDeselectable,
    }}
    /* TODO: We eventually may want to solidify types related to the available IconName(s) so we can
       use it for schema validation of data coming from the database. */
    data={props.data.map(datum => {
      let icon: IconName;
      const slug = datum.slug;
      if (!ProjectSlugs.contains(slug)) {
        logger.warn(
          `Encountered a project stored in the database without a corresponding hard-coded slug: ${slug}.`,
          { slug },
        );
        // This is the default, fallback icon...
        icon = "chart-kanban";
      } else {
        icon = ProjectSlugs.getModel(slug).icon;
      }
      return { ...datum, icon: { name: icon } };
    })}
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
