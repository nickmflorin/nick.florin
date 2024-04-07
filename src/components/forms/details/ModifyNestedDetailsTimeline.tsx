import { useState } from "react";

import { Timeline } from "@mantine/core";
import clsx from "clsx";

import { type NestedApiDetail } from "~/prisma/model";
import { TimelineIcon } from "~/components/icons/TimelineIcon";
import { DetailsTimeline } from "~/components/timelines/DetailsTimeline";
import { type ComponentProps } from "~/components/types";
import { useDeepEqualEffect } from "~/hooks";

import { CreateNestedDetailForm, type CreateNestedDetailFormProps } from "./create";
import { CollapsedUpdateDetailForm } from "./update/CollapsedUpdateDetailForm";

export interface ModifyNestedDetailsTimelineProps
  extends ComponentProps,
    Pick<CreateNestedDetailFormProps, "detailId" | "onCancel" | "onCreated"> {
  readonly details: NestedApiDetail<[]>[];
  readonly isCreating: boolean;
  readonly onExpand: (detail: NestedApiDetail<[]>) => void;
}

export const ModifyNestedDetailsTimeline = ({
  details,
  detailId,
  isCreating,
  onCreated,
  onCancel,
  onExpand,
  ...props
}: ModifyNestedDetailsTimelineProps): JSX.Element => {
  const [optimisticDetails, setOptimisticDetails] = useState<NestedApiDetail<[]>[]>(details);

  useDeepEqualEffect(() => {
    setOptimisticDetails(details);
  }, [details]);

  return (
    <DetailsTimeline {...props} className={clsx("h-full max-h-full w-full", props.className)}>
      {isCreating && (
        <Timeline.Item key="0" hidden={!isCreating} bullet={<TimelineIcon />}>
          <CreateNestedDetailForm
            key="new-detail"
            detailId={detailId}
            onCancel={onCancel}
            onCreated={detail => {
              setOptimisticDetails(curr => [{ ...detail, nestedDetails: [] }, ...curr]);
              onCreated(detail);
            }}
          />
        </Timeline.Item>
      )}
      {...optimisticDetails.map((detail, i) => (
        <Timeline.Item key={i + 1} bullet={<TimelineIcon />}>
          <CollapsedUpdateDetailForm
            key={detail.id}
            detail={detail}
            isExpanded={false}
            onExpand={() => onExpand(detail)}
            onDeleted={() => setOptimisticDetails(curr => curr.filter(d => d.id !== detail.id))}
          />
        </Timeline.Item>
      ))}
    </DetailsTimeline>
  );
};
