import dynamic from "next/dynamic";

import { getExperience } from "~/actions/fetches/get-experience";
import { ErrorView } from "~/components/views/ErrorView";
import { Loading } from "~/components/views/Loading";

const ExperienceForm = dynamic(
  () => import("~/components/forms/experiences/UpdateExperienceForm"),
  {
    loading: () => <Loading loading={true} />,
  },
);

const QueryParamDrawer = dynamic(() => import("./ServerDrawer"), {
  loading: () => <Loading loading={true} />,
});

export const UpdateExperienceDrawer = async ({
  experienceId,
}: {
  readonly experienceId: string;
}): Promise<JSX.Element> => {
  const experience = await getExperience(experienceId);
  return (
    <QueryParamDrawer param="skillId">
      {!experience ? (
        <ErrorView title="404">The requested resource could not be found.</ErrorView>
      ) : (
        <ExperienceForm experience={experience} />
      )}
    </QueryParamDrawer>
  );
};
