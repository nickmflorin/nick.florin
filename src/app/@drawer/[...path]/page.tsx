import { Suspense } from "react";

import { ServerDrawerContainer } from "~/components/drawers/ServerDrawerContainer";
import { parseSearchParams } from "~/components/drawers/types";
import { UpdateEducationDrawer } from "~/components/drawers/UpdateEducationDrawer";
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
      <ServerDrawerContainer param="updateEducationId">
        <Suspense fallback={<Loading loading={true} />}>
          <UpdateEducationDrawer educationId={drawerParams.updateEducationId} />
        </Suspense>
      </ServerDrawerContainer>
    );
  } else if (drawerParams.updateExperienceId) {
    return (
      <ServerDrawerContainer param="updateExperienceId">
        <Suspense fallback={<Loading loading={true} />}>
          <UpdateExperienceDrawer experienceId={drawerParams.updateExperienceId} />
        </Suspense>
      </ServerDrawerContainer>
    );
  } else if (drawerParams.updateSkillId) {
    return (
      <ServerDrawerContainer param="updateSkillId">
        <Suspense fallback={<Loading loading={true} />}>
          <UpdateSkillDrawer skillId={drawerParams.updateSkillId} />
        </Suspense>
      </ServerDrawerContainer>
    );
  }
  return null;
}
