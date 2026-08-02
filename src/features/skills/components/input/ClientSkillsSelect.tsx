'use client';
import { type ForwardedRef, type JSX, useState } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { type ActionVisibility } from '~/actions';
import { createSkill } from '~/actions/skills/create-skill';
import { type ApiError } from '~/api';

import { type SelectBehaviorType } from '~/components/input/select';
import { Text } from '~/components/typography';
import { useDebounceCallback } from '~/hooks';
import { useSkills } from '~/hooks/api';

import { SkillsSelect, type SkillsSelectInstance, type SkillsSelectProps } from './SkillsSelect';

export interface ClientSkillsSelectProps<B extends SelectBehaviorType> extends Omit<
  SkillsSelectProps<B>,
  'data' | 'onSearch' | 'search'
> {
  readonly onError?: (e: ApiError) => void;
  readonly visibility: ActionVisibility;
}

export const ClientSkillsSelect = <B extends SelectBehaviorType>({
  onError,
  ref,
  visibility,
  ...props
}: {
  readonly ref?: ForwardedRef<SkillsSelectInstance<B>>;
} & ClientSkillsSelectProps<B>): JSX.Element => {
  const [localSearch, setLocalSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const setSearch = useDebounceCallback((v: string) => setDebouncedSearch(v), 300);

  const { data, error, isLoading } = useSkills({
    onError: e => {
      logger.error(e, 'There was an error loading the repositories via the API.');
      onError?.(e);
    },
    query: { includes: [], order: 'asc', orderBy: 'label', search: debouncedSearch, visibility },
  });

  return (
    <SkillsSelect
      summarizeValueAfter={2}
      {...props}
      customItems={[
        {
          icon: { iconStyle: 'solid', name: 'plus-circle' },
          iconClassName: 'text-green-700',
          iconSize: '18px',
          id: 'add-skill',
          isLoading: true,
          isVisible:
            localSearch.trim().length >= 3 &&
            (data ?? []).filter(sk => sk.label === localSearch).length === 0,
          label: (
            <Text fontSize='sm' fontWeight='medium' truncate>
              Add Skill
            </Text>
          ),
          onClick: (e, item, select) => {
            void (async () => {
              item.setLoading(true);
              let response: Awaited<ReturnType<typeof createSkill>>;
              try {
                response = await createSkill({ label: localSearch });
              } catch (createSkillError) {
                logger.errorUnsafe(
                  createSkillError,
                  `There was an error creating the skill with label '${localSearch}'.`,
                  { label: localSearch },
                );
                toast.error('There was an error creating the skill.');
                return item.setLoading(false);
              }
              const { data: createdSkill, error: createdSkillError } = response;
              if (createdSkillError) {
                logger.error(
                  createdSkillError,
                  `There was an error creating the skill with label '${localSearch}'.`,
                  { label: localSearch },
                );
                toast.error('There was an error creating the skill.');
                return item.setLoading(false);
              }
              item.setLoading(false);
              select.addOptimisticModel(createdSkill, {
                dispatchChangeEvent: true,
                select: true,
              });
            })();
          },
          spinnerClassName: 'text-gray-600',
          spinnerSize: '16px',
        },
      ]}
      data={data ?? []}
      isDisabled={error !== undefined || props.isDisabled}
      isInputLoading={isLoading || props.isInputLoading}
      isLocked={isLoading || props.isLocked}
      isReady={data !== undefined && props.isReady !== false}
      onSearch={e => {
        setLocalSearch(e.target.value);
        setSearch(e.target.value);
      }}
      ref={ref}
      search={localSearch}
    />
  );
};
