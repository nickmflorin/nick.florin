"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import { isUuid } from "~/lib/typeguards";
import { DetailEntityType } from "~/prisma/model";
import { Loading } from "~/components/views/Loading";
import { useMutableParams } from "~/hooks";

const UpdateExperienceDrawer = dynamic(
  () => import("~/components/drawers/UpdateExperienceDrawer"),
  {
    loading: () => <Loading loading={true} />,
  },
);

const UpdateDetailsDrawer = dynamic(() => import("~/components/drawers/UpdateDetailsDrawer"), {
  loading: () => <Loading loading={true} />,
});

const UpdateCompanyDrawer = dynamic(() => import("~/components/drawers/UpdateCompanyDrawer"), {
  loading: () => <Loading loading={true} />,
});

export const Drawers = () => {
  const { params, clear } = useMutableParams();

  const updateExperienceId = useMemo(() => params.get("updateExperienceId"), [params]);
  const updateExperienceDetailsId = useMemo(
    () => params.get("updateExperienceDetailsId"),
    [params],
  );
  const updateCompanyId = useMemo(() => params.get("updateCompanyId"), [params]);

  if (isUuid(updateExperienceId)) {
    return (
      <UpdateExperienceDrawer
        experienceId={updateExperienceId}
        onClose={() => clear("updateExperienceId")}
      />
    );
  } else if (isUuid(updateExperienceDetailsId)) {
    return (
      <UpdateDetailsDrawer
        entityId={updateExperienceDetailsId}
        entityType={DetailEntityType.EXPERIENCE}
        onClose={() => clear("updateExperienceDetailsId")}
      />
    );
  } else if (isUuid(updateCompanyId)) {
    return (
      <UpdateCompanyDrawer companyId={updateCompanyId} onClose={() => clear("updateCompanyId")} />
    );
  }
  return null;
};
