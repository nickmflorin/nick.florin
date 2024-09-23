"use client";
import { forwardRef, type ForwardedRef, useState } from "react";

import { type ApiSkill } from "~/database/model";
import { logger } from "~/internal/logger";

import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";
import { useSkills, type SWRError } from "~/hooks/api-v2";

const getItemValue = (m: ApiSkill) => m.id;

export type SkillsSelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  ApiSkill,
  { behavior: B; getItemValue: typeof getItemValue }
>;

export interface SkillsSelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<ApiSkill, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "itemIsDisabled" | "data"
  > {
  readonly behavior: B;
  readonly onError?: (e: SWRError) => void;
}

export const SkillsSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { behavior, onError, ...props }: SkillsSelectProps<B>,
    ref: ForwardedRef<SkillsSelectInstance<B>>,
  ): JSX.Element => {
    const [search, setSearch] = useState("");

    const {
      data,
      isLoading: isLoading,
      error,
    } = useSkills({
      query: { includes: [], visibility: "admin", orderBy: "label", order: "asc", search },
      keepPreviousData: true,
      onError: e => {
        logger.error(e, "There was an error loading the skills via the API.", {
          search,
        });
        onError?.(e);
      },
    });

    return (
      <DataSelect<ApiSkill, { behavior: B; getItemValue: typeof getItemValue }>
        {...props}
        ref={ref}
        search={search}
        summarizeValueAfter={2}
        isReady={data !== undefined}
        data={data ?? []}
        isDisabled={error !== undefined}
        isLocked={isLoading}
        isLoading={isLoading}
        options={{ behavior, getItemValue }}
        getItemValueLabel={m => m.label}
        itemRenderer={m => m.label}
        onSearch={e => setSearch(e.target.value)}
      />
    );
  },
) as {
  <B extends SelectBehaviorType>(
    props: SkillsSelectProps<B> & {
      readonly ref?: ForwardedRef<SkillsSelectInstance<B>>;
    },
  ): JSX.Element;
};
