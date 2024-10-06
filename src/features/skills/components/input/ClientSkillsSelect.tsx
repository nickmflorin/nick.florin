"use client";
import { forwardRef, type ForwardedRef, useState } from "react";

import { logger } from "~/internal/logger";

import { type ActionVisibility } from "~/actions";
import { type ApiError } from "~/api";

import type { SelectBehaviorType } from "~/components/input/select";
import { Text } from "~/components/typography";
import { useDebounceCallback } from "~/hooks";
import { useSkills } from "~/hooks/api";

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
    const [localSeach, setLocalSearch] = useState("");
    const [search, _setSearch] = useState("");

    const setSearch = useDebounceCallback((v: string) => _setSearch(v), 300);

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
        search={localSeach}
        isReady={data !== undefined && props.isReady !== false}
        data={data ?? []}
        isDisabled={error !== undefined || props.isDisabled}
        isLocked={isLoading || props.isLocked}
        isLoading={isLoading || props.isLoading}
        onSearch={e => {
          setLocalSearch(e.target.value);
          setSearch(e.target.value);
        }}
        bottomItems={[
          {
            label: (
              <Text fontSize="sm" truncate fontWeight="medium">
                Add Skill
              </Text>
            ),
            iconSize: "18px",
            icon: { name: "plus-circle", iconStyle: "solid" },
            iconClassName: "text-green-700",
            isVisible:
              localSeach.trim().length !== 0 &&
              (data ?? []).filter(sk => sk.label === search).length === 0,
            onClick: () => {
              /* eslint-disable-next-line no-console -- This is temporary. */
              console.log("Added Skill");
            },
          },
        ]}
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
