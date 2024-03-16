"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import { isUuid } from "~/lib/typeguards";
import { Loading } from "~/components/views/Loading";
import { useMutableParams } from "~/hooks";

const UpdateSkillDrawer = dynamic(() => import("~/components/drawers/UpdateSkillDrawer"), {
  loading: () => <Loading loading={true} />,
});

export const Drawers = () => {
  const { params, clear } = useMutableParams();

  const updateSkillId = useMemo(() => params.get("updateSkillId"), [params]);

  if (isUuid(updateSkillId)) {
    return <UpdateSkillDrawer skillId={updateSkillId} onClose={() => clear("updateSkillId")} />;
  }
  return null;
};
