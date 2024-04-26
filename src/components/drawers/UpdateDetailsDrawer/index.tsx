import dynamic from "next/dynamic";
import { useState } from "react";

import {
  type DetailEntityType,
  type NestedApiDetail,
  type ApiDetail,
  isNestedDetail,
} from "~/prisma/model";
import { IconButton } from "~/components/buttons";
import { Loading } from "~/components/feedback/Loading";
import { Title } from "~/components/typography/Title";

import { Drawer } from "../Drawer";
import { DrawerContent } from "../DrawerContent";
import { DrawerHeader } from "../DrawerHeader";
import { type ExtendingDrawerProps } from "../provider";

const UpdateDetailsCollapsedDrawer = dynamic(() => import("./UpdateDetailsCollapsedDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const UpdateDetailsExpandedDrawer = dynamic(() => import("./UpdateDetailsExpandedDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

export interface UpdateDetailsDrawerProps<T extends DetailEntityType>
  extends ExtendingDrawerProps<{
    readonly entityType: T;
    readonly entityId: string;
  }> {}

export const UpdateDetailsDrawer = <T extends DetailEntityType>({
  entityType,
  entityId,
}: UpdateDetailsDrawerProps<T>): JSX.Element => {
  const [expandedDetail, setExpandedDetail] = useState<NestedApiDetail<[]> | ApiDetail<[]> | null>(
    null,
  );
  return (
    <Drawer>
      {expandedDetail ? (
        <>
          <DrawerHeader>
            <div className="flex flex-row items-center gap-[8px]">
              <IconButton.Light
                icon={{ name: "arrow-left" }}
                onClick={() => setExpandedDetail(null)}
              />
              <Title order={4}>{expandedDetail.label}</Title>
            </div>
          </DrawerHeader>
          <DrawerContent>
            <UpdateDetailsExpandedDrawer
              detailId={expandedDetail.id}
              isNested={isNestedDetail(expandedDetail)}
            />
          </DrawerContent>
        </>
      ) : (
        <UpdateDetailsCollapsedDrawer
          entityType={entityType}
          entityId={entityId}
          onExpand={detail => setExpandedDetail(detail)}
        />
      )}
    </Drawer>
  );
};

export default UpdateDetailsDrawer;
