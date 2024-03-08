import { DetailEntityType } from "@prisma/client";

import { getDetails } from "~/actions/fetches/get-details";
import { ErrorView } from "~/components/views/Error";

import { ModifyDetailsView } from "../details/ModifyDetailsView";

export const UpdateExperienceDetailsForm = async ({
  experienceId,
}: {
  readonly experienceId: string;
}): Promise<JSX.Element> => {
  const details = await getDetails(experienceId, DetailEntityType.EXPERIENCE);
  if (!details) {
    return <ErrorView title="404">The requested resource could not be found.</ErrorView>;
  }
  return (
    <ModifyDetailsView
      title={details.entity.title}
      details={details.details}
      entityId={experienceId}
      entityType={DetailEntityType.EXPERIENCE}
    />
  );
};
