"use client";
import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { DetailEntityType } from "~/prisma/model";
import { useDrawerParams } from "~/components/drawers/hooks";
import { Loading } from "~/components/views/Loading";

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
  const { params, close, ids } = useDrawerParams();

  if (isUuid(params.updateExperience)) {
    return (
      <UpdateExperienceDrawer
        experienceId={params.updateExperience}
        onClose={() => close(ids.UPDATE_EXPERIENCE)}
      />
    );
  } else if (isUuid(params.updateExperienceDetails)) {
    return (
      <UpdateDetailsDrawer
        entityId={params.updateExperienceDetails}
        entityType={DetailEntityType.EXPERIENCE}
        onClose={() => close(ids.UPDATE_EXPERIENCE_DETAILS)}
      />
    );
  } else if (isUuid(params.updateCompany)) {
    return (
      <UpdateCompanyDrawer
        companyId={params.updateCompany}
        onClose={() => close(ids.UPDATE_COMPANY)}
      />
    );
  }
  return null;
};
