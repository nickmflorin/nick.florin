import { type DetailEntityType, type NestedApiDetail, type ApiDetail } from "~/prisma/model";

import { Drawer } from "~/components/drawers/Drawer";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { ModifyDetailsView } from "~/features/resume/components/forms/ModifyDetailsView";
import { useDetails } from "~/hooks";

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
            <Drawer.Header>{title}</Drawer.Header>
            <Drawer.Content className="pr-[18px]">
              <ModifyDetailsView {...props} details={obj.details} />
            </Drawer.Content>
          </>
        );
      }}
    </ApiResponseState>
  );
};

export default UpdateDetailsCollapsedDrawer;
