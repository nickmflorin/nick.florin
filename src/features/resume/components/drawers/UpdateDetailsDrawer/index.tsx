import dynamic from "next/dynamic";
import { useState } from "react";

import {
  type DetailEntityType,
  type NestedApiDetail,
  type ApiDetail,
  isNestedDetail,
} from "~/database/model";

import { IconButton } from "~/components/buttons";
import { type ExtendingDrawerProps } from "~/components/drawers";
import { ContextDrawer } from "~/components/drawers/ContextDrawer";
import { Loading } from "~/components/loading/Loading";
import { Title } from "~/components/typography";

const UpdateDetailsCollapsedDrawer = dynamic(() => import("./UpdateDetailsCollapsedDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const UpdateDetailsExpandedDrawer = dynamic(() => import("./UpdateDetailsExpandedDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

export interface UpdateDetailsDrawerProps<T extends DetailEntityType> extends ExtendingDrawerProps {
  readonly entityType: T;
  readonly entityId: string;
}

export const UpdateDetailsDrawer = <T extends DetailEntityType>({
  entityType,
  entityId,
}: UpdateDetailsDrawerProps<T>): JSX.Element => {
  const [expandedDetail, setExpandedDetail] = useState<NestedApiDetail<[]> | ApiDetail<[]> | null>(
    null,
  );
  return (
    <ContextDrawer>
      {expandedDetail ? (
        <>
          <ContextDrawer.Header>
            <div className="flex flex-row items-center gap-[8px]">
              <IconButton.Transparent
                scheme="light"
                icon={{ name: "arrow-left" }}
                onClick={() => setExpandedDetail(null)}
              />
              <Title component="h4">{expandedDetail.label}</Title>
            </div>
          </ContextDrawer.Header>
          <ContextDrawer.Content>
            <UpdateDetailsExpandedDrawer
              detailId={expandedDetail.id}
              isNested={isNestedDetail(expandedDetail)}
            />
          </ContextDrawer.Content>
        </>
      ) : (
        <UpdateDetailsCollapsedDrawer
          entityType={entityType}
          entityId={entityId}
          onExpand={detail => setExpandedDetail(detail)}
        />
      )}
    </ContextDrawer>
  );
};

export default UpdateDetailsDrawer;
