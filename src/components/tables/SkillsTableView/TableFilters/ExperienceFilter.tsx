"use client";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useTransition, useCallback } from "react";

import { encodeQueryParam } from "~/lib/urls";
import { type ApiExperience } from "~/prisma/model";
import { ExperienceSelect } from "~/components/input/select/ExperienceSelect";

import { type Filters } from "../types";

export interface ExperienceFilterProps {
  readonly filters: Filters;
  readonly experiences: ApiExperience[];
}

export const ExperienceFilter = ({ filters, experiences }: ExperienceFilterProps) => {
  const [value, _setValue] = useState<string[]>([]);
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [_, transition] = useTransition();

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
      const newParams = new URLSearchParams(searchParams?.toString());
      if (ids.length === 0) {
        newParams.delete("experiences");
      } else {
        newParams.set("experiences", encodeQueryParam(ids));
      }
      transition(() => {
        replace(`${pathname}?${newParams.toString()}`);
      });
    },
    [searchParams, pathname, replace],
  );

  return (
    <ExperienceSelect
      inputClassName="w-[320px]"
      menuClassName="max-h-[260px]"
      placeholder="Experiences"
      data={experiences}
      value={value}
      maximumNumBadges={1}
      onChange={v => setValue(v)}
      placement="bottom"
    />
  );
};

export default ExperienceFilter;
