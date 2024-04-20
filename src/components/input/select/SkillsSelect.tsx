"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import type { ApiExperience, ApiEducation, BrandSkill } from "~/prisma/model";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { DynamicLoader, DynamicLoading } from "~/components/feedback/dynamic-loading";
import { SelectBase } from "~/components/input/select/generic/SelectBase";
import type { MenuContentComponent } from "~/components/menus";
import { MenuContainer } from "~/components/menus/generic/MenuContainer";
import { MenuHeader } from "~/components/menus/generic/MenuHeader";
import { useSkills } from "~/hooks";

const MenuContent = dynamic(() => import("~/components/menus/generic/MenuContent"), {
  loading: () => <DynamicLoader />,
}) as MenuContentComponent;

type Model = ApiExperience<["skills"]> | ApiEducation<["skills"]>;

const globalOptions = {
  isMulti: true,
  getModelValue: (m: BrandSkill) => m.id,
  getModelLabel: (m: BrandSkill) => m.label,
  getModelValueLabel: (m: BrandSkill) => m.label,
} as const;

export interface SkillsSelectProps<M extends Model> {
  readonly model: M;
}

export const SkillsSelect = <M extends Model>({ model }: SkillsSelectProps<M>) => {
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useSkills({
    query: { includes: [], visibility: "admin", orderBy: { label: "asc" } },
    keepPreviousData: true,
  });
  return (
    <DynamicLoading>
      {({ isLoading: _isDynamicallyLoading }) => (
        <SelectBase
          dynamicHeight={false}
          options={globalOptions}
          data={data ?? []}
          maximumNumBadges={3}
          isReady={data !== undefined}
          isLoading={isLoading || _isDynamicallyLoading}
          /* eslint-disable-next-line no-console */
          onChange={v => console.log(v)}
          value={model.skills.map(sk => sk.id)}
          content={({ selectModel, isReady, value }) => (
            <MenuContainer className="box-shadow-none">
              <MenuHeader search={search} onSearch={(e, v) => setSearch(v)} />
              <ApiResponseState isLoading={isLoading} error={error} data={data}>
                {skills => (
                  <MenuContent<BrandSkill, typeof globalOptions>
                    options={globalOptions}
                    data={skills}
                    value={value}
                    isReady={isReady}
                    onItemClick={(model, v, instance) => selectModel(v, instance)}
                  />
                )}
              </ApiResponseState>
            </MenuContainer>
          )}
        />
      )}
    </DynamicLoading>
  );
};

export default SkillsSelect;
