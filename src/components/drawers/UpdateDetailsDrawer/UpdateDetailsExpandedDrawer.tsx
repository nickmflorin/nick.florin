import { isUuid } from "~/lib/typeguards";

import { ApiResponseState } from "~/components/feedback/ApiResponseState";
/* eslint-disable-next-line max-len */
import { ExpandedUpdateDetailForm } from "~/components/forms/details/update/ExpandedUpdateDetailForm";
import { useDetail } from "~/hooks/api/use-detail";

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
      query: { includes: ["skills", "nestedDetails"], visibility: "admin" },
    },
  );
  return (
    <ApiResponseState error={error} isLoading={isLoading} data={data}>
      {detail => <ExpandedUpdateDetailForm detail={detail} isExpanded />}
    </ApiResponseState>
  );
};

export default UpdateDetailExpandedDrawer;
