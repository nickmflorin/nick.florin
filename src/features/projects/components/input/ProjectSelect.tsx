import { forwardRef, type ForwardedRef } from "react";

import { type BrandProject, ProjectSlugs } from "~/database/model";
import { logger } from "~/internal/logger";

import { type HttpError } from "~/api";

import { type IconProp, type IconName } from "~/components/icons";
import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";
import { Text, Description } from "~/components/typography";
import { useProjects } from "~/hooks";

type M = Omit<BrandProject, "icon"> & { readonly icon: IconProp | IconName };

const getItemValue = (m: M) => m.id;

export interface ProjectSelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<M, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "itemIsDisabled" | "data"
  > {
  readonly behavior: B;
  readonly onError?: (e: HttpError) => void;
}

export const ProjectSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { behavior, onError, ...props }: ProjectSelectProps<B>,
    ref: ForwardedRef<DataSelectInstance<M, { behavior: B; getItemValue: typeof getItemValue }>>,
  ): JSX.Element => {
    const { data, isLoading, error } = useProjects({
      query: { includes: [], visibility: "admin" },
      onError: e => {
        logger.error(e, "There was an error loading the projects via the API.");
        onError?.(e);
      },
    });

    return (
      <DataSelect<M, { behavior: B; getItemValue: typeof getItemValue }>
        {...props}
        ref={ref}
        isReady={data !== undefined}
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
        isDisabled={error !== undefined}
        isLocked={isLoading}
        isLoading={isLoading}
        options={{ behavior, getItemValue }}
        getItemValueLabel={m => m.shortName ?? m.name}
        itemRenderer={m => (
          <div className="flex flex-col gap-[4px]">
            <Text fontSize="sm" fontWeight="medium" truncate>
              {m.name}
            </Text>
            <Description fontSize="xs">{m.slug}</Description>
          </div>
        )}
      />
    );
  },
) as {
  <B extends SelectBehaviorType>(
    props: ProjectSelectProps<B> & {
      readonly ref?: ForwardedRef<
        DataSelectInstance<M, { behavior: B; getItemValue: typeof getItemValue }>
      >;
    },
  ): JSX.Element;
};
