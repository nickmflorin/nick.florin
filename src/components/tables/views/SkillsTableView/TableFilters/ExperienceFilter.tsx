"use client";
import { useState, useEffect, useMemo, useCallback } from "react";

import { isRecordType, isUuid } from "~/lib/typeguards";
import { type ApiExperience } from "~/prisma/model";
import { ExperienceSelect } from "~/components/input/select/ExperienceSelect";
import { useMutableParams } from "~/hooks";

import { type Filters } from "../types";

export interface ExperienceFilterProps {
  readonly filters: Filters;
  readonly experiences: ApiExperience[];
}

export const ExperienceFilter = ({ filters, experiences }: ExperienceFilterProps) => {
  const [value, _setValue] = useState<string[]>([]);
  const { set } = useMutableParams();

  const queryValue = useMemo(() => {
    const ids = experiences.map(e => e.id);
    return filters.experiences.filter(id => ids.includes(id));
  }, [experiences, filters.experiences]);

  useEffect(() => {
    _setValue(queryValue);
  }, [queryValue]);

  const setValue = useCallback(
    (ids: string[]) => {
      _setValue(ids);
      set("filters", curr =>
        isRecordType(curr)
          ? {
              ...curr,
              experiences: ids.filter(i => isUuid(i)),
            }
          : { experiences: ids.filter(i => isUuid(i)) },
      );
    },
    [set],
  );

  return (
    <ExperienceSelect
      inputClassName="w-[320px]"
      menuClassName="max-h-[260px]"
      placeholder="Experiences"
      data={experiences}
      value={value}
      options={{ isMulti: true, isClearable: true }}
      maximumValuesToRender={1}
      onChange={v => setValue(v)}
      menuPlacement="bottom"
    />
  );
};

export default ExperienceFilter;
