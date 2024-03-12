import dynamic from "next/dynamic";

import { getSkill } from "~/actions/fetches/get-skill";
import { ErrorView } from "~/components/views/Error";
import { Loading } from "~/components/views/Loading";

import { SkillDrawerContent } from "./DrawerContent";

const QueryParamDrawer = dynamic(() => import("../QueryParamDrawer"), {
  loading: () => <Loading loading={true} />,
});

export const SkillDrawer = async ({
  skillId,
}: {
  readonly skillId: string;
}): Promise<JSX.Element> => {
  const skill = await getSkill(skillId);
  return (
    <QueryParamDrawer param="skillId" className="overflow-y-scroll">
      {!skill ? (
        <ErrorView title="404">The requested resource could not be found.</ErrorView>
      ) : (
        <SkillDrawerContent skill={skill} />
      )}
    </QueryParamDrawer>
  );
};
