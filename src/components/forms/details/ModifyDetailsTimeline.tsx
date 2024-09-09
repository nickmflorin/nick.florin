import { useState } from "react";

import { Timeline } from "@mantine/core";
import clsx from "clsx";

import { type ApiDetail, type NestedApiDetail } from "~/prisma/model";

import { TimelineIcon } from "~/components/icons/TimelineIcon";
import { DetailsTimeline } from "~/components/timelines/DetailsTimeline";
import { type ComponentProps } from "~/components/types";
import { useDeepEqualEffect } from "~/hooks";

import { CreateDetailForm, type CreateDetailFormProps } from "./create";
import { ModifyDetailView } from "./ModifyDetailView";

export interface ModifyDetailsTimelineProps
  extends ComponentProps,
    Pick<CreateDetailFormProps, "entityId" | "entityType" | "onCancel" | "onCreated" | "onCancel"> {
  readonly details: ApiDetail<["nestedDetails", "skills"]>[];
  readonly createFormVisible: boolean;
  readonly onExpand: (detail: ApiDetail<[]> | NestedApiDetail<[]>) => void;
}

export const ModifyDetailsTimeline = ({
  details,
  createFormVisible,
  entityId,
  entityType,
  onExpand,
  onCreated,
  onCancel,
  ...props
}: ModifyDetailsTimelineProps): JSX.Element => {
  const [optimisticDetails, setOptimisticDetails] =
    useState<ApiDetail<["nestedDetails", "skills"]>[]>(details);

  useDeepEqualEffect(() => {
    setOptimisticDetails(details);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [details]);

  return (
    <DetailsTimeline {...props} className={clsx("h-full max-h-full w-full", props.className)}>
      <Timeline.Item key="0" hidden={!createFormVisible} bullet={<TimelineIcon />}>
        <CreateDetailForm
          key="new-detail"
          entityId={entityId}
          entityType={entityType}
          onCancel={onCancel}
          onCreated={detail => {
            setOptimisticDetails(curr => [{ ...detail, nestedDetails: [] }, ...curr]);
            onCreated(detail);
          }}
        />
      </Timeline.Item>
      {...optimisticDetails.map((detail, i) => (
        <Timeline.Item key={i + 1} bullet={<TimelineIcon />}>
          <ModifyDetailView
            detail={detail}
            onDeleted={() => setOptimisticDetails(curr => curr.filter(d => d.id !== detail.id))}
            onExpand={onExpand}
          />
        </Timeline.Item>
      ))}
    </DetailsTimeline>
  );
};
