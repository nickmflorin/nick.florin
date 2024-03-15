import dynamic from "next/dynamic";

import { getEducation } from "~/actions/fetches/get-education";
import { ErrorView } from "~/components/views/ErrorView";
import { Loading } from "~/components/views/Loading";

const EducationForm = dynamic(() => import("~/components/forms/educations/UpdateEducationForm"), {
  loading: () => <Loading loading={true} />,
});

const QueryParamDrawer = dynamic(() => import("./ServerDrawer"), {
  loading: () => <Loading loading={true} />,
});

export const UpdateEducationDrawer = async ({
  educationId,
}: {
  readonly educationId: string;
}): Promise<JSX.Element> => {
  const education = await getEducation(educationId);
  return (
    <QueryParamDrawer param="updateEducationId">
      {!education ? (
        <ErrorView title="404">The requested resource could not be found.</ErrorView>
      ) : (
        <EducationForm education={education} />
      )}
    </QueryParamDrawer>
  );
};
