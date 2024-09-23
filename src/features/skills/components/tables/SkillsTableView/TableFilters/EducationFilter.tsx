"use client";
import { useState, useEffect, useMemo, useCallback } from "react";

import { type ApiEducation } from "~/database/model";
import { isRecordType, isUuid } from "~/lib/typeguards";

import { EducationSelect } from "~/features/educations/components/input/EducationSelect";
import { useMutableParams } from "~/hooks";

import { type Filters } from "../types";

export interface EducationFilterProps {
  readonly filters: Filters;
  readonly educations: ApiEducation[];
}

export const EducationFilter = ({ filters, educations }: EducationFilterProps) => {
  const [value, _setValue] = useState<string[]>([]);
  const { set } = useMutableParams();

  const queryValue = useMemo(() => {
    const ids = educations.map(e => e.id);
    return filters.educations.filter(id => ids.includes(id));
  }, [educations, filters.educations]);

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
              educations: ids.filter(i => isUuid(i)),
            }
          : { educations: ids.filter(i => isUuid(i)) },
      );
    },
    [set],
  );

  return (
    <EducationSelect
      inputClassName="w-[320px]"
      placeholder="Educations"
      data={educations}
      behavior="multi"
      isClearable
      value={value}
      maximumValuesToRender={1}
      onChange={v => setValue(v)}
      popoverPlacement="bottom"
    />
  );
};

export default EducationFilter;
