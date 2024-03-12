import { Suspense } from "react";

import { SkillDrawer } from "~/components/drawers/SkillDrawer";
import { parseSearchParams } from "~/components/drawers/types";
import { UpdateEducationDetailsDrawer } from "~/components/drawers/UpdateEducationDetailsDrawer";
import { UpdateEducationDrawer } from "~/components/drawers/UpdateEducationDrawer";
import { UpdateExperienceDetailsDrawer } from "~/components/drawers/UpdateExperienceDetailsDrawer";
import { UpdateExperienceDrawer } from "~/components/drawers/UpdateExperienceDrawer";
import { UpdateSkillDrawer } from "~/components/drawers/UpdateSkillDrawer";
import { Loading } from "~/components/views/Loading";

interface ApplicationDrawerProps {
  readonly searchParams: Record<string, string | undefined>;
}

export default async function ApplicationDrawer({ searchParams }: ApplicationDrawerProps) {
  const drawerParams = parseSearchParams(searchParams);

  if (drawerParams.updateEducationId) {
    return (
      <Suspense fallback={<Loading loading={true} />}>
        <UpdateEducationDrawer educationId={drawerParams.updateEducationId} />
      </Suspense>
    );
  } else if (drawerParams.updateExperienceId) {
    return (
      <Suspense fallback={<Loading loading={true} />}>
        <UpdateExperienceDrawer experienceId={drawerParams.updateExperienceId} />
      </Suspense>
    );
  } else if (drawerParams.updateEducationDetailsId) {
    return (
      <Suspense fallback={<Loading loading={true} />}>
        <UpdateEducationDetailsDrawer educationId={drawerParams.updateEducationDetailsId} />
      </Suspense>
    );
  } else if (drawerParams.updateExperienceDetailsId) {
    return (
      <Suspense fallback={<Loading loading={true} />}>
        <UpdateExperienceDetailsDrawer experienceId={drawerParams.updateExperienceDetailsId} />
      </Suspense>
    );
  } else if (drawerParams.updateSkillId) {
    return (
      <Suspense fallback={<Loading loading={true} />}>
        <UpdateSkillDrawer skillId={drawerParams.updateSkillId} />
      </Suspense>
    );
  } else if (drawerParams.skillId) {
    return (
      <Suspense fallback={<Loading loading={true} />}>
        <SkillDrawer skillId={drawerParams.skillId} />
      </Suspense>
    );
  }
  return null;
}
