"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { type ApiExperience } from "~/database/model";
import { logger } from "~/internal/logger";

import { updateExperience } from "~/actions/mutations/experiences";
import { isApiClientErrorJson } from "~/api";

import type * as types from "~/components/tables/types";
import { CompanySelect } from "~/features/companies/components/input/CompanySelect";

interface CompanyCellProps {
  readonly experience: ApiExperience<["details", "skills"]>;
  readonly table: types.CellTableInstance<ApiExperience<["details", "skills"]>>;
}

export const CompanyCell = ({ experience, table }: CompanyCellProps): JSX.Element => {
  const [value, setValue] = useState(experience.companyId);
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(experience.companyId);
  }, [experience.companyId]);

  return (
    <CompanySelect
      inputClassName="w-full"
      menuClassName="max-h-[260px]"
      isClearable
      behavior="single"
      value={value}
      onChange={async v => {
        // Optimistically update the value.
        setValue(v);
        table.setRowLoading(experience.id, true);
        let response: Awaited<ReturnType<typeof updateExperience>> | null = null;
        try {
          response = await updateExperience(experience.id, { company: v });
        } catch (e) {
          logger.error(`There was a server error updating the experience's company:\n${e}`, {
            error: e,
            experience: experience.id,
            company: v,
          });
          toast.error("There was an error updating the experience.");
        } finally {
          table.setRowLoading(experience.id, false);
        }
        if (response && isApiClientErrorJson(response)) {
          logger.error("There was a client error updating the experience's company.", {
            error: response,
            experience: experience.id,
            company: v,
          });
          toast.error("There was an error updating the experience.");
        }
        transition(() => {
          router.refresh();
        });
      }}
    />
  );
};

export default CompanyCell;
