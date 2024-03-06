import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { type FullDetail, type DetailEntityType, type NestedDetail } from "~/prisma/model";
import { type ComponentProps } from "~/components/types";
import { Loading } from "~/components/views/Loading";

import { CreateDetailForm } from "./CreateDetailForm";
import { type WithoutNestedDetails } from "./types";
import { UpdateDetailForm } from "./UpdateDetailForm";

const DetailsTimeline = dynamic(() => import("~/components/timelines/DetailsTimeline"), {
  loading: () => <Loading loading={true} />,
});

export interface UpdateDetailsTimelineProps<D extends FullDetail | NestedDetail>
  extends ComponentProps {
  readonly isCreating?: boolean;
  readonly details: D[];
  readonly entityId: string;
  readonly entityType: DetailEntityType;
  readonly onCreateSuccess?: (detail: WithoutNestedDetails<D>) => void;
}

export const UpdateDetailsTimeline = <D extends FullDetail | NestedDetail>({
  isCreating = false,
  details,
  entityId,
  entityType,
  onCreateSuccess,
  ...props
}: UpdateDetailsTimelineProps<D>) => {
  const [_, transition] = useTransition();
  const { refresh } = useRouter();

  return (
    <DetailsTimeline
      {...props}
      items={[
        isCreating ? (
          <CreateDetailForm
            entityId={entityId}
            entityType={entityType}
            onSuccess={detail => {
              onCreateSuccess?.(detail);
              transition(() => {
                refresh();
              });
            }}
          />
        ) : null,
        ...details.map(detail => (
          <UpdateDetailForm
            key={detail.id}
            detail={detail}
            onSuccess={() => {
              /* Note: We may not need this transition, since this is just updating a detail and
                 we only currently show the number of details in the table. */
              transition(() => {
                refresh();
              });
            }}
          />
        )),
      ]}
    />
  );
};
