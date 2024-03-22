import { type Education, DetailEntityType, type Experience } from "~/prisma/model";
import { ModifyDetailsView } from "~/components/forms/details/ModifyDetailsView";
import { ApiResponseView } from "~/components/views/ApiResponseView";
import { useDetails } from "~/hooks";

import { ClientDrawer } from "./ClientDrawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";

import { type DrawerId } from ".";

interface UpdateDetailsDrawerProps<T extends DetailEntityType> {
  readonly entityType: T;
  readonly entityId: string;
  readonly onClose: () => void;
}

const DrawerIds: { [key in DetailEntityType]: DrawerId } = {
  [DetailEntityType.EDUCATION]: "update-education-details",
  [DetailEntityType.EXPERIENCE]: "update-experience-details",
};

export const UpdatDetailsDrawer = <T extends DetailEntityType>({
  entityType,
  onClose,
  entityId,
}: UpdateDetailsDrawerProps<T>): JSX.Element => {
  const { data, isLoading, error } = useDetails(entityId, entityType, {
    keepPreviousData: true,
  });

  return (
    <ClientDrawer onClose={onClose} id={DrawerIds[entityType]}>
      <ApiResponseView error={error} isLoading={isLoading} data={data}>
        {obj => {
          const title = (obj as { education: Education }).education
            ? (obj as { education: Education }).education.major
            : (obj as { experience: Experience }).experience.title;
          return (
            <>
              <DrawerHeader>{title}</DrawerHeader>
              <DrawerContent className="pr-[18px]">
                <ModifyDetailsView
                  details={obj.details}
                  entityId={entityId}
                  entityType={entityType}
                />
              </DrawerContent>
            </>
          );
        }}
      </ApiResponseView>
    </ClientDrawer>
  );
};

export default UpdatDetailsDrawer;
