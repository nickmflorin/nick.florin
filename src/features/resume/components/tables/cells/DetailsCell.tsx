import { type ApiEducation, type ApiExperience } from "~/database/model";

import { Link } from "~/components/buttons";
import { DrawerIds } from "~/components/drawers";
import { type DrawerDynamicProps } from "~/components/drawers/drawers";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";

type Model = ApiExperience<["details"]> | ApiEducation<["details"]>;

type ModelDrawerIds = {
  experience: typeof DrawerIds.UPDATE_EXPERIENCE_DETAILS;
  education: typeof DrawerIds.UPDATE_EDUCATION_DETAILS;
};

const DrawerProps = {
  experience: {
    id: DrawerIds.UPDATE_EXPERIENCE_DETAILS,
    props: (id: string) => ({ entityId: id }),
  },
  education: {
    id: DrawerIds.UPDATE_EDUCATION_DETAILS,
    props: (id: string) => ({ entityId: id }),
  },
} as const satisfies {
  [key in Model["$kind"]]: {
    id: ModelDrawerIds[key];
    props: (id: string) => DrawerDynamicProps<ModelDrawerIds[key]>;
  };
};

interface DetailsCellProps {
  readonly model: Model;
}

export const DetailsCell = ({ model }: DetailsCellProps) => {
  const { open } = useDrawers();

  return (
    <Link.Primary
      onClick={() => open(DrawerProps[model.$kind].id, DrawerProps[model.$kind].props(model.id))}
    >{`${model.details.length} Details`}</Link.Primary>
  );
};
