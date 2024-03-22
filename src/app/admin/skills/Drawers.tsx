"use client";
import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { useDrawerParams } from "~/components/drawers/hooks";
import { Loading } from "~/components/views/Loading";

const UpdateSkillDrawer = dynamic(() => import("~/components/drawers/UpdateSkillDrawer"), {
  loading: () => <Loading loading={true} />,
});

export const Drawers = () => {
  const { params, close, ids } = useDrawerParams();

  if (isUuid(params.updateSkill)) {
    return (
      <UpdateSkillDrawer skillId={params.updateSkill} onClose={() => close(ids.UPDATE_SKILL)} />
    );
  }
  return null;
};
