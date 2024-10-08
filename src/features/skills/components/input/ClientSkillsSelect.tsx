"use client";
import { forwardRef, type ForwardedRef, useState, useCallback, useRef, useEffect } from "react";

import { type ApiSkill } from "~/database/model";
import { logger } from "~/internal/logger";

import { type ActionVisibility } from "~/actions";
import { createSkill } from "~/actions/skills/create-skill";
import { apiClient } from "~/api";
import { type ApiError } from "~/api";
import { type ApiClientResponseOrError } from "~/api/client";

import type { SelectBehaviorType } from "~/components/input/select";
import { Text } from "~/components/typography";
import { useDebounceCallback } from "~/hooks";

import { SkillsSelect, type SkillsSelectInstance, type SkillsSelectProps } from "./SkillsSelect";

export interface ClientSkillsSelectProps<B extends SelectBehaviorType>
  extends Omit<SkillsSelectProps<B>, "data" | "onSearch" | "search"> {
  readonly visibility: ActionVisibility;
  readonly onError?: (e: ApiError) => void;
}

type FetchSearchParams = {
  readonly search?: string;
  readonly loadingClosure?: (v: boolean) => void;
};

export const ClientSkillsSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { visibility, onError, ...props }: ClientSkillsSelectProps<B>,
    ref: ForwardedRef<SkillsSelectInstance<B>>,
  ): JSX.Element => {
    const lastSearchedRef = useRef<string | null>(null);

    const [localSearch, setLocalSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const setSearch = useDebounceCallback((v: string) => setDebouncedSearch(v), 300);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<ApiError | string | undefined>(undefined);
    const [data, setData] = useState<ApiSkill<[]>[] | undefined>(undefined);

    const fetchSkills = useCallback(
      async (params: FetchSearchParams) => {
        const search = params.search ?? lastSearchedRef.current ?? "";
        params.loadingClosure?.(true);
        const response: ApiClientResponseOrError<ApiSkill<[]>[]> = await apiClient.get(
          "/api/skills",
          {
            includes: [],
            visibility,
            orderBy: "label",
            order: "asc",
            search,
          },
          { processed: true, strict: false },
        );
        const { error: e, response: data } = response;
        if (e) {
          setError(e);
          onError?.(e);
          logger.error(e, "There was an error loading the skills via the API.", {
            search,
          });
          return params.loadingClosure?.(false);
        }
        lastSearchedRef.current = search;
        params.loadingClosure?.(false);
        return setData(data);
      },
      [visibility, onError],
    );

    useEffect(() => {
      fetchSkills({ search: debouncedSearch, loadingClosure: setIsLoading });
    }, [debouncedSearch, fetchSkills]);

    /* const {
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
       }); */

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
              localSearch.trim().length !== 0 &&
              (data ?? []).filter(sk => sk.label === localSearch).length === 0,
            onClick: async (e, item, select) => {
              item.setLoading(true);
              let response: Awaited<ReturnType<typeof createSkill>>;
              try {
                response = await createSkill({ label: localSearch });
              } catch (e) {
                item.setLoading(false);
                return;
              }
              const { error, data } = response;
              if (error) {
                item.setLoading(false);
                return;
              }
              /* TODO: Instead of waiting for the skills to refetch here, and then performing the
                 select - we should incorporate a 'addOptimisticModel' method to the data select
                 instance, with an option for "preemptive-selecting". */
              await fetchSkills({});
              select.select(data.id);
              item.setLoading(false);
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
