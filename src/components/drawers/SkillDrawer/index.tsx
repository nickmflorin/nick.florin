"use client";
import { useMemo } from "react";

import { isUuid } from "~/lib/typeguards";
import { ApiResponseView } from "~/components/views/ApiResponseView";
import { useSkill, useMutableParams } from "~/hooks";

import { ClientDrawer } from "../ClientDrawer";

import { SkillDrawerContent } from "./DrawerContent";

export const SkillDrawer = (): JSX.Element => {
  const { params, clear } = useMutableParams();

  const skillId = useMemo(() => params.get("skillId"), [params]);

  const { data, isLoading, error } = useSkill(skillId, {
    keepPreviousData: true,
  });

  if (isUuid(skillId)) {
    return (
      <ClientDrawer onClose={() => clear("skillId")} className="overflow-y-scroll">
        <ApiResponseView error={error} isLoading={isLoading} data={data}>
          {skill => <SkillDrawerContent skill={skill} />}
        </ApiResponseView>
      </ClientDrawer>
    );
  }
  return <></>;
};

export default SkillDrawer;
