"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { type ApiExperience } from "~/prisma/model";
import { updateExperience } from "~/actions/mutations/experiences";
import { isApiClientErrorJson } from "~/api";
import { ClientCompanySelect } from "~/components/input/select/ClientCompanySelect";
import type * as types from "~/components/tables/types";

interface CompanyCellProps {
  readonly experience: ApiExperience<["details"]>;
  readonly table: types.TableInstance<ApiExperience<["details"]>>;
}

export const CompanyCell = ({ experience, table }: CompanyCellProps): JSX.Element => {
  const [value, setValue] = useState(experience.companyId);
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(experience.companyId);
  }, [experience.companyId]);

  return (
    <ClientCompanySelect
      inputClassName="w-[300px]"
      menuClassName="max-h-[260px]"
      value={value}
      onChange={async v => {
        // Optimistically update the value.
        setValue(v);
        table.setRowLoading(experience.id, true);
        let response: Awaited<ReturnType<typeof updateExperience>> | null = null;
        try {
          response = await updateExperience(experience.id, { company: v });
        } catch (e) {
          const logger = (await import("~/application/logger")).logger;
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
          const logger = (await import("~/application/logger")).logger;
          logger.error("There was a client error updating the experience's company.", {
            error: response,
            experience: experience.id,
            company: v,
          });
          toast.error("There was an error updating the experience.");
        } else {
          /* Refresh the page state from the server.  This is not entirely necessary, but will
             revert any changes that were made if the request fails. */
          transition(() => {
            router.refresh();
          });
        }
      }}
    />
  );
};

export default CompanyCell;
