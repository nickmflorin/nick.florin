import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { IconButton } from "~/components/buttons";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { Loading } from "~/components/feedback/Loading";
import { Title } from "~/components/typography/Title";
import { useDetail } from "~/hooks/api/use-detail";

import { DrawerContent } from "../DrawerContent";
import { DrawerHeader } from "../DrawerHeader";

const DetailForm = dynamic(
  () => import("~/components/forms/details/update/ExpandedUpdateDetailForm"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

interface UpdateDetailExpandedDrawerProps {
  readonly detailId: string;
  readonly isNested: boolean;
  readonly onBack: () => void;
}

export const UpdateDetailExpandedDrawer = ({
  detailId,
  isNested,
  onBack,
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
        <>
          <DrawerHeader>
            <div className="flex flex-row items-center gap-[8px]">
              <IconButton.Light icon={{ name: "arrow-left" }} onClick={() => onBack()} />
              <Title order={4}>{detail.label}</Title>
            </div>
          </DrawerHeader>
          <DrawerContent>
            <DetailForm detail={detail} isExpanded />
          </DrawerContent>
        </>
      )}
    </ApiResponseState>
  );
};

export default UpdateDetailExpandedDrawer;
