import dynamic from "next/dynamic";
import { useState } from "react";

import { type ApiEducation, type ApiExperience } from "~/prisma/model";
import { Link } from "~/components/buttons";
import { type DrawerId, DrawerIds } from "~/components/drawers";
import { DynamicLoading, DynamicLoader } from "~/components/feedback/dynamic-loading";

const ClientDrawer = dynamic(() => import("~/components/drawers/ClientDrawer"), {
  loading: () => <DynamicLoader />,
});

type Model = ApiExperience<["details"]> | ApiEducation<["details"]>;

const ModelDrawerIds: { [key in Model["$kind"]]: DrawerId } = {
  experience: DrawerIds.UPDATE_EXPERIENCE_DETAILS,
  education: DrawerIds.UPDATE_EDUCATION_DETAILS,
};

interface DetailsCellProps {
  readonly model: Model;
}

export const DetailsCell = ({ model }: DetailsCellProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <DynamicLoading>
      {({ isLoading }) => (
        <>
          <Link.Primary
            isLoading={isLoading}
            onClick={() => setDrawerOpen(true)}
          >{`${model.details.length} Details`}</Link.Primary>
          {drawerOpen && (
            <ClientDrawer
              id={ModelDrawerIds[model.$kind]}
              props={{}}
              onClose={() => setDrawerOpen(false)}
            />
          )}
        </>
      )}
    </DynamicLoading>
  );
};

export default DetailsCell;
