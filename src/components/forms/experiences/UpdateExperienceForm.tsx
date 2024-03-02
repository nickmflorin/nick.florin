import dynamic from "next/dynamic";

import { getExperience } from "~/actions/fetches/get-experience";
import { ErrorView } from "~/components/views/Error";
import { Loading } from "~/components/views/Loading";

const ExperienceForm = dynamic(() => import("./ClientUpdateExperienceForm"), {
  loading: () => <Loading loading={true} />,
});

export const UpdateExperienceForm = async ({
  experienceId,
}: {
  readonly experienceId: string;
}): Promise<JSX.Element> => {
  const experience = await getExperience(experienceId);
  if (!experience) {
    return <ErrorView title="404">The requested resource could not be found.</ErrorView>;
  }
  return <ExperienceForm experience={experience} />;
};
