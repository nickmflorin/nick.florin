import dynamic from "next/dynamic";

import { DetailEntityType } from "@prisma/client";

import { getDetails } from "~/actions/fetches/get-details";
import { Title } from "~/components/typography/Title";
import { ErrorView } from "~/components/views/Error";
import { Loading } from "~/components/views/Loading";

const DetailsForm = dynamic(() => import("../details/ModifyDetailsView"), {
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
    <div className="flex flex-col gap-[10px] h-full max-h-full w-full relative">
      <Title order={4}>{details.entity.title}</Title>
      <div className="relative grow w-full max-h-full overflow-y-scroll pr-[18px]">
        <DetailsForm
          details={details.details}
          entityId={experienceId}
          entityType={DetailEntityType.EXPERIENCE}
        />
      </div>
    </div>
  );
};
