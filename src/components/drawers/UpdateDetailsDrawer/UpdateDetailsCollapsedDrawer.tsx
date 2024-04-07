import {
  type Education,
  type DetailEntityType,
  type Experience,
  type NestedApiDetail,
  type ApiDetail,
} from "~/prisma/model";
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
    includes: ["nestedDetails"],
  });

  return (
    <ApiResponseState error={error} isLoading={isLoading} data={data}>
      {obj => {
        const title = (obj as { education: Education }).education
          ? (obj as { education: Education }).education.major
          : (obj as { experience: Experience }).experience.title;
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
