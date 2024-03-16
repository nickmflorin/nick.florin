"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import { isUuid } from "~/lib/typeguards";
import { DetailEntityType } from "~/prisma/model";
import { Loading } from "~/components/views/Loading";
import { useMutableParams } from "~/hooks";

const UpdateEducationDrawer = dynamic(() => import("~/components/drawers/UpdateEducationDrawer"), {
  loading: () => <Loading loading={true} />,
});

const UpdateDetailsDrawer = dynamic(() => import("~/components/drawers/UpdateDetailsDrawer"), {
  loading: () => <Loading loading={true} />,
});

export const Drawers = () => {
  const { params, clear } = useMutableParams();

  const updateEducationId = useMemo(() => params.get("updateEducationId"), [params]);
  const updateEducationDetailsId = useMemo(() => params.get("updateEducationDetailsId"), [params]);

  if (isUuid(updateEducationId)) {
    return (
      <UpdateEducationDrawer
        educationId={updateEducationId}
        onClose={() => clear("updateEducationId")}
      />
    );
  } else if (isUuid(updateEducationDetailsId)) {
    return (
      <UpdateDetailsDrawer
        entityId={updateEducationDetailsId}
        entityType={DetailEntityType.EDUCATION}
        onClose={() => clear("updateEducationDetailsId")}
      />
    );
  }
  return null;
};
