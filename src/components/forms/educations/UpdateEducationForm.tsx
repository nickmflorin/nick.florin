import dynamic from "next/dynamic";

import { getEducation } from "~/actions/fetches/get-education";
import { ErrorView } from "~/components/views/Error";
import { Loading } from "~/components/views/Loading";

const EducationForm = dynamic(() => import("./ClientUpdateEducationForm"), {
  loading: () => <Loading loading={true} />,
});

export const UpdateEducationForm = async ({
  educationId,
}: {
  readonly educationId: string;
}): Promise<JSX.Element> => {
  const education = await getEducation(educationId);
  if (!education) {
    return <ErrorView title="404">The requested resource could not be found.</ErrorView>;
  }
  return education ? <EducationForm education={education} /> : <></>;
};
