"use client";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useTransition, useCallback } from "react";

import { encodeQueryParam } from "~/lib/urls";
import { type ApiEducation } from "~/prisma/model";
import { EducationSelect } from "~/components/input/select/EducationSelect";

import { type Filters } from "../types";

export interface EducationFilterProps {
  readonly filters: Filters;
  readonly educations: ApiEducation[];
}

export const EducationFilter = ({ filters, educations }: EducationFilterProps) => {
  const [value, _setValue] = useState<string[]>([]);
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [_, transition] = useTransition();

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
      const newParams = new URLSearchParams(searchParams?.toString());
      if (ids.length === 0) {
        newParams.delete("educations");
      } else {
        newParams.set("educations", encodeQueryParam(ids));
      }
      transition(() => {
        replace(`${pathname}?${newParams.toString()}`);
      });
    },
    [searchParams, pathname, replace],
  );

  return (
    <EducationSelect
      inputClassName="w-[320px]"
      menuClassName="max-h-[260px]"
      placeholder="Educations"
      data={educations}
      value={value}
      maximumNumBadges={1}
      onChange={v => setValue(v)}
      placement="bottom"
    />
  );
};

export default EducationFilter;
