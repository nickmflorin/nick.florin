import dynamic from "next/dynamic";

import { DetailEntityType } from "@prisma/client";

import { getDetails } from "~/actions/fetches/get-details";
import { ModifyDetailsView } from "~/components/forms/details/ModifyDetailsView";
import { ErrorView } from "~/components/views/Error";
import { Loading } from "~/components/views/Loading";

const QueryParamDrawer = dynamic(() => import("./QueryParamDrawer"), {
  loading: () => <Loading loading={true} />,
});

export const UpdateEducationDetailsDrawer = async ({
  educationId,
}: {
  readonly educationId: string;
}): Promise<JSX.Element> => {
  const details = await getDetails(educationId, DetailEntityType.EDUCATION);
  return (
    <QueryParamDrawer param="updateEducationDetailsId" className="pl-[16px] pb-[16px] pt-[16px]">
      {!details ? (
        <ErrorView title="404">The requested resource could not be found.</ErrorView>
      ) : (
        <ModifyDetailsView
          title={details.entity.major}
          details={details.details}
          entityId={educationId}
          entityType={DetailEntityType.EDUCATION}
        />
      )}
    </QueryParamDrawer>
  );
};
