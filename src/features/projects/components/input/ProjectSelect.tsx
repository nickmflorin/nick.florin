import { type ForwardedRef, type JSX } from 'react';

import { type BrandProject, ProjectSlugs } from '~/database/model';
import { logger } from '~/internal/logger';

import { type IconName, type IconProp } from '~/components/icons';
import { type DataSelectInstance, type SelectBehaviorType } from '~/components/input/select';
import { DataSelect, type DataSelectProps } from '~/components/input/select/DataSelect';
import { Description, Text } from '~/components/typography';

export type ProjectSelectModel = {
  readonly icon: IconName | IconProp;
} & Omit<BrandProject, 'icon'>;

const getModelValue = (m: ProjectSelectModel) => m.id;

export type ProjectSelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  ProjectSelectModel,
  { behavior: B; getModelValue: typeof getModelValue }
>;

export interface ProjectSelectProps<B extends SelectBehaviorType> extends Omit<
  DataSelectProps<ProjectSelectModel, { behavior: B; getModelValue: typeof getModelValue }>,
  | 'data'
  | 'getModelValueLabel'
  | 'itemIsDisabled'
  | 'itemRenderer'
  | 'options'
  | 'shouldIncludeDescriptions'
> {
  readonly behavior: B;
  readonly data: BrandProject[];
  readonly hasAbbreviatedLabels?: boolean;
}

export const ProjectSelect = <B extends SelectBehaviorType>({
  behavior,
  data,
  hasAbbreviatedLabels = true,
  ref,
  ...props
}: {
  readonly ref?: ForwardedRef<ProjectSelectInstance<B>>;
} & ProjectSelectProps<B>): JSX.Element => (
  <DataSelect<ProjectSelectModel, { behavior: B; getModelValue: typeof getModelValue }>
    {...props}
    data={data.map(datum => {
      let icon: IconName;
      const slug = datum.slug;
      if (ProjectSlugs.contains(slug)) {
        icon = ProjectSlugs.getModel(slug).icon;
      } else {
        logger.warn(
          'Encountered a project stored in the database without a corresponding hard-coded ' +
            `slug: ${slug}.`,
          { slug },
        );
        // This is the default, fallback icon...
        icon = 'chart-kanban';
      }
      return { ...datum, icon: { name: icon } };
    })}
    getModelValueLabel={m => m.shortName ?? m.name}
    itemRenderer={m => (
      <div className='flex flex-col gap-[4px]'>
        <Text fontSize='sm' fontWeight='medium' truncate>
          {hasAbbreviatedLabels ? (m.shortName ?? m.name) : m.name}
        </Text>
        <Description fontSize='xs'>{m.slug}</Description>
      </div>
    )}
    options={{ behavior, getModelValue }}
    ref={ref}
    shouldIncludeDescriptions={false}
  />
);
