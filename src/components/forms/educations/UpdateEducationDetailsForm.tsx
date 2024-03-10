import { DetailEntityType } from "@prisma/client";

import { getDetails } from "~/actions/fetches/get-details";
import { ErrorView } from "~/components/views/Error";

import { ModifyDetailsView } from "../details/ModifyDetailsView";

export const UpdateEducationDetailsForm = async ({
  educationId,
}: {
  readonly educationId: string;
}): Promise<JSX.Element> => {
  const details = await getDetails(educationId, DetailEntityType.EDUCATION);
  if (!details) {
    return <ErrorView title="404">The requested resource could not be found.</ErrorView>;
  }
  return (
    <ModifyDetailsView
      title={details.entity.major}
      details={details.details}
      entityId={educationId}
      entityType={DetailEntityType.EDUCATION}
    />
  );
};
