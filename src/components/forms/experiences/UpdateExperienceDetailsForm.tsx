import dynamic from "next/dynamic";

import { DetailEntityType } from "@prisma/client";

import { getDetails } from "~/actions/fetches/get-details";
import { ErrorView } from "~/components/views/Error";
import { Loading } from "~/components/views/Loading";

const DetailsForm = dynamic(() => import("../details/ClientDetailsForm"), {
  loading: () => <Loading loading={true} />,
});

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
    <DetailsForm
      details={details.details}
      title={details.entity.title}
      entityId={experienceId}
      entityType={DetailEntityType.EXPERIENCE}
    />
  );
};
