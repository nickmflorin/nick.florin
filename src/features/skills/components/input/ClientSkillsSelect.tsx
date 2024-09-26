"use client";
import { forwardRef, type ForwardedRef, useState } from "react";

import { logger } from "~/internal/logger";

import { type ActionVisibility } from "~/actions-v2";
import { type ApiError } from "~/api-v2";

import type { SelectBehaviorType } from "~/components/input/select";
import { useSkills } from "~/hooks/api-v2";

import { SkillsSelect, type SkillsSelectInstance, type SkillsSelectProps } from "./SkillsSelect";

export interface ClientSkillsSelectProps<B extends SelectBehaviorType>
  extends Omit<SkillsSelectProps<B>, "data" | "onSearch" | "search"> {
  readonly visibility: ActionVisibility;
  readonly onError?: (e: ApiError) => void;
}

export const ClientSkillsSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { visibility, onError, ...props }: ClientSkillsSelectProps<B>,
    ref: ForwardedRef<SkillsSelectInstance<B>>,
  ): JSX.Element => {
    const [search, setSearch] = useState("");

    const {
      data,
      isLoading: isLoading,
      error,
    } = useSkills({
      query: { includes: [], visibility, orderBy: "label", order: "asc", search },
      keepPreviousData: true,
      onError: e => {
        logger.error(e, "There was an error loading the skills via the API.", {
          search,
        });
        onError?.(e);
      },
    });

    return (
      <SkillsSelect
        summarizeValueAfter={2}
        {...props}
        ref={ref}
        search={search}
        isReady={data !== undefined && props.isReady !== false}
        data={data ?? []}
        isDisabled={error !== undefined || props.isDisabled}
        isLocked={isLoading || props.isLocked}
        isLoading={isLoading || props.isLoading}
        onSearch={e => setSearch(e.target.value)}
      />
    );
  },
) as {
  <B extends SelectBehaviorType>(
    props: ClientSkillsSelectProps<B> & {
      readonly ref?: ForwardedRef<SkillsSelectInstance<B>>;
    },
  ): JSX.Element;
};
