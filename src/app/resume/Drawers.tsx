"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import { isUuid } from "~/lib/typeguards";
import { Loading } from "~/components/views/Loading";
import { useMutableParams } from "~/hooks";

const SkillDrawer = dynamic(() => import("~/components/drawers/SkillDrawer"), {
  loading: () => <Loading loading={true} />,
});

export const Drawers = () => {
  const { params, clear } = useMutableParams();

  const skillId = useMemo(() => params.get("skillId"), [params]);

  if (isUuid(skillId)) {
    return <SkillDrawer skillId={skillId} onClose={() => clear("skillId")} />;
  }
  return null;
};
