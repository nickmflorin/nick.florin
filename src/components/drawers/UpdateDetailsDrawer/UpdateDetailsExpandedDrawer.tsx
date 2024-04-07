import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { Loading } from "~/components/feedback/Loading";
import { useDetail } from "~/hooks/api/use-detail";

import { DrawerContent } from "../DrawerContent";

const DetailForm = dynamic(
  () => import("~/components/forms/details/update/ExpandedUpdateDetailForm"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

interface UpdateDetailExpandedDrawerProps {
  readonly detailId: string;
  readonly isNested: boolean;
}

export const UpdateDetailExpandedDrawer = ({
  detailId,
  isNested,
}: UpdateDetailExpandedDrawerProps): JSX.Element => {
  const { data, isLoading, error } = useDetail(
    isUuid(detailId) ? { id: detailId, isNested } : null,
    {
      keepPreviousData: true,
      includes: ["skills", "nestedDetails"],
    },
  );
  return (
    <ApiResponseState error={error} isLoading={isLoading} data={data}>
      {detail => (
        <DrawerContent>
          <DetailForm detail={detail} isExpanded />
        </DrawerContent>
      )}
    </ApiResponseState>
  );
};

export default UpdateDetailExpandedDrawer;
