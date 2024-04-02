import { type Education, type DetailEntityType, type Experience } from "~/prisma/model";
import { ModifyDetailsView } from "~/components/forms/details/ModifyDetailsView";
import { ApiResponseView } from "~/components/views/ApiResponseView";
import { useDetails } from "~/hooks";

import { Drawer } from "./Drawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";

import { type ExtendingDrawerProps } from ".";

export interface UpdateDetailsDrawerProps<T extends DetailEntityType>
  extends ExtendingDrawerProps<{
    readonly entityType: T;
    readonly entityId: string;
  }> {}

export const UpdateDetailsDrawer = <T extends DetailEntityType>({
  entityType,
  entityId,
}: UpdateDetailsDrawerProps<T>): JSX.Element => {
  const { data, isLoading, error } = useDetails(
    entityId,
    entityType,
    { nestedDetails: true },
    { keepPreviousData: true },
  );

  return (
    <Drawer>
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
    </Drawer>
  );
};

export default UpdateDetailsDrawer;
