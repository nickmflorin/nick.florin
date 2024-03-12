import { Suspense } from "react";

/* eslint-disable-next-line max-len */
import { UpdateEducationDetailsForm } from "~/components/forms/educations/UpdateEducationDetailsForm";
import { UpdateEducationForm } from "~/components/forms/educations/UpdateEducationForm";
/* eslint-disable-next-line max-len */
import { UpdateExperienceDetailsForm } from "~/components/forms/experiences/UpdateExperienceDetailsForm";
import { UpdateExperienceForm } from "~/components/forms/experiences/UpdateExperienceForm";
import { Loading } from "~/components/views/Loading";

import { parseSearchParams } from "../../../components/drawers/types";

import { ServerDrawerWrapper } from "./ServerDrawerWrapper";

interface ApplicationDrawerProps {
  readonly searchParams: Record<string, string | undefined>;
}

export default async function ApplicationDrawer({ searchParams }: ApplicationDrawerProps) {
  const drawerParams = parseSearchParams(searchParams);

  if (drawerParams.updateEducationId) {
    return (
      <ServerDrawerWrapper param="updateEducationId">
        <Suspense fallback={<Loading loading={true} />}>
          <UpdateEducationForm educationId={drawerParams.updateEducationId} />
        </Suspense>
      </ServerDrawerWrapper>
    );
  } else if (drawerParams.updateExperienceId) {
    return (
      <ServerDrawerWrapper param="updateExperienceId">
        <Suspense fallback={<Loading loading={true} />}>
          <UpdateExperienceForm experienceId={drawerParams.updateExperienceId} />
        </Suspense>
      </ServerDrawerWrapper>
    );
  } else if (drawerParams.updateEducationDetailsId) {
    return (
      <ServerDrawerWrapper
        className="pl-[16px] pb-[16px] pt-[16px]"
        param="updateEducationDetailsId"
      >
        <Suspense fallback={<Loading loading={true} />}>
          <UpdateEducationDetailsForm educationId={drawerParams.updateEducationDetailsId} />
        </Suspense>
      </ServerDrawerWrapper>
    );
  } else if (drawerParams.updateExperienceDetailsId) {
    return (
      <ServerDrawerWrapper
        className="pl-[16px] pb-[16px] pt-[16px]"
        param="updateExperienceDetailsId"
      >
        <Suspense fallback={<Loading loading={true} />}>
          <UpdateExperienceDetailsForm experienceId={drawerParams.updateExperienceDetailsId} />
        </Suspense>
      </ServerDrawerWrapper>
    );
  }
  return <></>;
}
