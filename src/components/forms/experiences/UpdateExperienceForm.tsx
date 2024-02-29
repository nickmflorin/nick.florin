import dynamic from "next/dynamic";

import { getExperience } from "~/actions/fetches/get-experience";
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
  // TODO: Show an error dialog here.
  return experience ? <ExperienceForm experience={experience} /> : <></>;
};
