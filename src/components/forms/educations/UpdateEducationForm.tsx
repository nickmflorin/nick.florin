import dynamic from "next/dynamic";

import { getEducation } from "~/actions/fetches/get-education";
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
  // TODO: Show an error dialog here.
  return education ? <EducationForm education={education} /> : <></>;
};
