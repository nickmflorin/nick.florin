import { type DetailEntityType, type NestedApiDetail, type ApiDetail } from "~/prisma/model";

import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { ModifyDetailsView } from "~/components/forms/details/ModifyDetailsView";
import { useDetails } from "~/hooks";

import { DrawerContent } from "../DrawerContent";
import { DrawerHeader } from "../DrawerHeader";

export interface UpdateDetailsCollapsedDrawerProps<T extends DetailEntityType> {
  readonly entityType: T;
  readonly entityId: string;
  readonly onExpand: (detail: NestedApiDetail<[]> | ApiDetail<[]>) => void;
}

export const UpdateDetailsCollapsedDrawer = <T extends DetailEntityType>(
  props: UpdateDetailsCollapsedDrawerProps<T>,
): JSX.Element => {
  const { data, isLoading, error } = useDetails(props.entityId, props.entityType, {
    keepPreviousData: true,
    query: { includes: ["nestedDetails", "skills"], visibility: "admin" },
  });
  return (
    <ApiResponseState error={error} isLoading={isLoading} data={data}>
      {obj => {
        const title = obj.entity.$kind === "education" ? obj.entity.major : obj.entity.title;
        return (
          <>
            <DrawerHeader>{title}</DrawerHeader>
            <DrawerContent className="pr-[18px]">
              <ModifyDetailsView {...props} details={obj.details} />
            </DrawerContent>
          </>
        );
      }}
    </ApiResponseState>
  );
};

export default UpdateDetailsCollapsedDrawer;
