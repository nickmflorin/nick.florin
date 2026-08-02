'use client';
import { type ResumeBrand } from '~/database/model';

import { IconButton } from '~/components/buttons';
import { type DrawerId, type DrawerIdPropsPair, DrawerIds } from '~/components/drawers';
import { useDrawers } from '~/components/drawers/hooks/use-drawers';
import { classNames } from '~/components/types';

type ModelDrawerId = Extract<
  DrawerId,
  typeof DrawerIds.VIEW_EDUCATION | typeof DrawerIds.VIEW_EXPERIENCE
>;

export const ModelDrawerProps: Record<
  ResumeBrand,
  (modelId: string) => DrawerIdPropsPair<ModelDrawerId>
> = {
  education: modelId => ({
    id: DrawerIds.VIEW_EDUCATION,
    props: { educationId: modelId },
  }),
  experience: modelId => ({
    id: DrawerIds.VIEW_EXPERIENCE,
    props: { experienceId: modelId },
  }),
};

export interface ExpandResumeModelButtonProps<T extends ResumeBrand> {
  readonly modelId: string;
  readonly modelType: T;
  readonly tourId?: string;
}

export const ExpandResumeModelButton = <T extends ResumeBrand>({
  modelId,
  modelType,
  tourId,
}: ExpandResumeModelButtonProps<T>) => {
  const { open } = useDrawers();

  return (
    <IconButton.Transparent
      className={classNames(
        'rounded-full text-gray-500 hover:text-gray-600',
        'min-h-[22px] h-[22px] w-[22px]',
      )}
      icon={{ iconStyle: 'solid', name: 'up-right-and-down-left-from-center' }}
      iconSize='14px'
      onClick={() =>
        open(ModelDrawerProps[modelType](modelId).id, ModelDrawerProps[modelType](modelId).props)
      }
      size='small'
      tourId={tourId}
    />
  );
};
