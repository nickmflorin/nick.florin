import { forwardRef, type ForwardedRef } from "react";

import { type BrandProject, ProjectSlugs } from "~/database/model";
import { logger } from "~/internal/logger";

import { type IconProp, type IconName } from "~/components/icons";
import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";
import { Text, Description } from "~/components/typography";

export type ProjectSelectModel = Omit<BrandProject, "icon"> & {
  readonly icon: IconProp | IconName;
};

const getItemValue = (m: ProjectSelectModel) => m.id;

export type ProjectSelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  ProjectSelectModel,
  { behavior: B; getItemValue: typeof getItemValue }
>;

export interface ProjectSelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<ProjectSelectModel, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "itemIsDisabled" | "data"
  > {
  readonly behavior: B;
  readonly data: BrandProject[];
}

export const ProjectSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { behavior, data, ...props }: ProjectSelectProps<B>,
    ref: ForwardedRef<ProjectSelectInstance<B>>,
  ): JSX.Element => (
    <DataSelect<ProjectSelectModel, { behavior: B; getItemValue: typeof getItemValue }>
      {...props}
      ref={ref}
      data={(data ?? []).map(datum => {
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
      options={{ behavior, getItemValue }}
      getItemValueLabel={m => m.shortName ?? m.name}
      includeDescriptions={false}
      itemRenderer={m => (
        <div className="flex flex-col gap-[4px]">
          <Text fontSize="sm" fontWeight="medium" truncate>
            {m.name}
          </Text>
          <Description fontSize="xs">{m.slug}</Description>
        </div>
      )}
    />
  ),
) as {
  <B extends SelectBehaviorType>(
    props: ProjectSelectProps<B> & {
      readonly ref?: ForwardedRef<ProjectSelectInstance<B>>;
    },
  ): JSX.Element;
};
