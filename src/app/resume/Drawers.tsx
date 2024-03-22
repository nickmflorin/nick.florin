"use client";
import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { useDrawerParams } from "~/components/drawers/hooks";
import { Loading } from "~/components/views/Loading";

const SkillDrawer = dynamic(() => import("~/components/drawers/SkillDrawer"), {
  loading: () => <Loading loading={true} />,
});

export const Drawers = () => {
  const { params, close, ids } = useDrawerParams();

  if (isUuid(params.viewSkill)) {
    return <SkillDrawer skillId={params.viewSkill} onClose={() => close(ids.VIEW_SKILL)} />;
  }
  return null;
};
