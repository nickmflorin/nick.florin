import { type DetailEntityType, type ApiNestedDetail, type ApiDetail } from "~/database/model";

import { ApiResponseState } from "~/components/ApiResponseState";
import { ContextDrawer } from "~/components/drawers/ContextDrawer";
import { ModifyDetailsView } from "~/features/resume/components/forms/ModifyDetailsView";
import { useDetails } from "~/hooks/api";

export interface UpdateDetailsCollapsedDrawerProps<T extends DetailEntityType> {
  readonly entityType: T;
  readonly entityId: string;
  readonly onExpand: (detail: ApiNestedDetail<[]> | ApiDetail<[]>) => void;
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
            <ContextDrawer.Header>{title}</ContextDrawer.Header>
            <ContextDrawer.Content className="pr-[18px]">
              <ModifyDetailsView {...props} details={obj.details} />
            </ContextDrawer.Content>
          </>
        );
      }}
    </ApiResponseState>
  );
};

export default UpdateDetailsCollapsedDrawer;
