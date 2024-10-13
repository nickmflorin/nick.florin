"use client";
import { forwardRef, type ForwardedRef, useState } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { type ActionVisibility } from "~/actions";
import { createSkill } from "~/actions/skills/create-skill";
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
    const [localSearch, setLocalSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const setSearch = useDebounceCallback((v: string) => setDebouncedSearch(v), 300);

    /* const [isLoading, setIsLoading] = useState(false);
       const [error, setError] = useState<ApiError | string | undefined>(undefined);
       const [data, setData] = useState<ApiSkill<[]>[] | undefined>(undefined); */

    const { data, isLoading, error } = useSkills({
      query: { includes: [], visibility, orderBy: "label", order: "asc", search: debouncedSearch },
      onError: e => {
        logger.error(e, "There was an error loading the repositories via the API.");
        onError?.(e);
      },
    });

    return (
      <SkillsSelect
        summarizeValueAfter={2}
        {...props}
        ref={ref}
        search={localSearch}
        isReady={data !== undefined && props.isReady !== false}
        data={data ?? []}
        isDisabled={error !== undefined || props.isDisabled}
        isLocked={isLoading || props.isLocked}
        inputIsLoading={isLoading || props.inputIsLoading}
        onSearch={e => {
          setLocalSearch(e.target.value);
          setSearch(e.target.value);
        }}
        customItems={[
          {
            id: "add-skill",
            label: (
              <Text fontSize="sm" truncate fontWeight="medium">
                Add Skill
              </Text>
            ),
            iconSize: "18px",
            isLoading: true,
            icon: { name: "plus-circle", iconStyle: "solid" },
            iconClassName: "text-green-700",
            spinnerClassName: "text-gray-600",
            spinnerSize: "16px",
            isVisible:
              localSearch.trim().length >= 3 &&
              (data ?? []).filter(sk => sk.label === localSearch).length === 0,
            onClick: async (e, item, select) => {
              item.setLoading(true);
              let response: Awaited<ReturnType<typeof createSkill>>;
              try {
                response = await createSkill({ label: localSearch });
              } catch (e) {
                logger.errorUnsafe(
                  e,
                  `There was an error creating the skill with label '${localSearch}'.`,
                  { label: localSearch },
                );
                toast.error("There was an error creating the skill.");
                return item.setLoading(false);
              }
              const { error, data } = response;
              if (error) {
                logger.error(
                  error,
                  `There was an error creating the skill with label '${localSearch}'.`,
                  { label: localSearch },
                );
                toast.error("There was an error creating the skill.");
                return item.setLoading(false);
              }
              item.setLoading(false);
              select.addOptimisticModel(data, { select: true, dispatchChangeEvent: true });
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
