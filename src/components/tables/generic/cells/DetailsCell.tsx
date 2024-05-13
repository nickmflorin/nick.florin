import dynamic from "next/dynamic";

import { type ApiEducation, type ApiExperience } from "~/prisma/model";
import { Link } from "~/components/buttons";
import { type ClientDrawerComponent, DrawerIds } from "~/components/drawers";
import { useDrawerState } from "~/components/drawers/hooks/use-drawer-state";
import { type DrawerDynamicProps } from "~/components/drawers/provider/drawers";
import { DynamicLoading, DynamicLoader } from "~/components/feedback/dynamic-loading";

const ClientDrawer = dynamic(() => import("~/components/drawers/ClientDrawer"), {
  loading: () => <DynamicLoader />,
}) as ClientDrawerComponent;

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
  const { isOpen, open } = useDrawerState({
    drawerId: DrawerProps[model.$kind].id,
    props: DrawerProps[model.$kind].props(model.id),
  });

  return (
    <DynamicLoading>
      {({ isLoading }) => (
        <>
          <Link.Primary
            isLoading={isLoading}
            onClick={() => open()}
          >{`${model.details.length} Details`}</Link.Primary>
          {isOpen && (
            <ClientDrawer
              id={DrawerProps[model.$kind].id}
              props={DrawerProps[model.$kind].props(model.id)}
            />
          )}
        </>
      )}
    </DynamicLoading>
  );
};

export default DetailsCell;
