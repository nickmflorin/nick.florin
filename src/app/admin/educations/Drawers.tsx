"use client";
import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { DetailEntityType } from "~/prisma/model";
import { useDrawerParams } from "~/components/drawers/hooks";
import { Loading } from "~/components/views/Loading";

const UpdateEducationDrawer = dynamic(() => import("~/components/drawers/UpdateEducationDrawer"), {
  loading: () => <Loading loading={true} />,
});

const UpdateDetailsDrawer = dynamic(() => import("~/components/drawers/UpdateDetailsDrawer"), {
  loading: () => <Loading loading={true} />,
});

const UpdateSchoolDrawer = dynamic(() => import("~/components/drawers/UpdateSchoolDrawer"), {
  loading: () => <Loading loading={true} />,
});

export const Drawers = () => {
  const { params, close, ids } = useDrawerParams();
  if (isUuid(params.updateEducation)) {
    return (
      <UpdateEducationDrawer
        educationId={params.updateEducation}
        onClose={() => close(ids.UPDATE_EDUCATION)}
      />
    );
  } else if (isUuid(params.updateEducationDetails)) {
    return (
      <UpdateDetailsDrawer
        entityId={params.updateEducationDetails}
        entityType={DetailEntityType.EDUCATION}
        onClose={() => close(ids.UPDATE_EDUCATION_DETAILS)}
      />
    );
  } else if (isUuid(params.updateSchool)) {
    return (
      <UpdateSchoolDrawer schoolId={params.updateSchool} onClose={() => close(ids.UPDATE_SCHOOL)} />
    );
  }
  return null;
};
