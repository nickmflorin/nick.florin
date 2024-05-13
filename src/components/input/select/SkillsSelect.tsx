import dynamic from "next/dynamic";
import { useState } from "react";

import type { BrandSkill } from "~/prisma/model";
import { type HttpError } from "~/api";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { DynamicLoader, DynamicLoading } from "~/components/feedback/dynamic-loading";
import { type SelectBaseProps } from "~/components/input/select/generic";
import { SelectBase } from "~/components/input/select/generic/SelectBase";
import type { MenuContentComponent } from "~/components/menus";
import { MenuContainer } from "~/components/menus/generic/MenuContainer";
import { MenuContentWrapper } from "~/components/menus/generic/MenuContentWrapper";
import { MenuHeader } from "~/components/menus/generic/MenuHeader";
import { useSkills } from "~/hooks";

const MenuContent = dynamic(() => import("~/components/menus/generic/MenuContent"), {
  loading: () => <DynamicLoader />,
}) as MenuContentComponent;

const globalOptions = {
  isMulti: true,
  isValueModeled: true,
  isDeselectable: true,
  getModelValue: (m: BrandSkill) => m.id,
  getModelLabel: (m: BrandSkill) => m.label,
  getModelValueLabel: (m: BrandSkill) => m.label,
} as const;

export type SkillSelectValueModel = {
  id: BrandSkill["id"];
  value: BrandSkill["id"];
  label: BrandSkill["label"];
};

export interface SkillsSelectProps
  extends Omit<
    SelectBaseProps<SkillSelectValueModel, BrandSkill, typeof globalOptions>,
    "data" | "options" | "isReady" | "content" | "maximumValuesToRender" | "isLoading"
  > {
  readonly onError?: (e: HttpError) => void;
}

export const SkillsSelect = ({ onError, ...props }: SkillsSelectProps) => {
  const [search, setSearch] = useState("");

  const {
    data,
    isLoading: isLoading,
    error,
  } = useSkills({
    query: { includes: [], visibility: "admin", orderBy: { label: "asc" }, filters: { search } },
    keepPreviousData: true,
    onError,
  });

  return (
    <DynamicLoading>
      {({ isLoading: _isDynamicallyLoading }) => (
        <SelectBase
          dynamicHeight={false}
          {...props}
          data={data ?? []}
          options={globalOptions}
          maximumValuesToRender={3}
          isReady={data !== undefined}
          isLoading={isLoading || _isDynamicallyLoading}
          content={({ onSelect, isSelected }) => (
            <MenuContainer className="box-shadow-none">
              <MenuHeader search={search} onSearch={(e, v) => setSearch(v)} />
              <MenuContentWrapper>
                <ApiResponseState isLoading={isLoading} error={error} data={data}>
                  {skills => (
                    /* We have to use the Abstract version of the MenuContent component because the
                       value is already being managed by the 'SelectBase' component, and we do not
                       want the MenuComponent to manage the value because it will issue warnings
                       about not being able to find the value in the data since the data provided
                       to the MenuComponent is filtered. */
                    <MenuContent<BrandSkill, typeof globalOptions>
                      options={globalOptions}
                      data={skills}
                      itemIsSelected={isSelected}
                      onItemClick={(model, instance) => onSelect(model, instance)}
                    />
                  )}
                </ApiResponseState>
              </MenuContentWrapper>
            </MenuContainer>
          )}
        />
      )}
    </DynamicLoading>
  );
};

export default SkillsSelect;
