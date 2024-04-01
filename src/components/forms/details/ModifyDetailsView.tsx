"use client";
import { useState } from "react";

import { Timeline } from "@mantine/core";
import clsx from "clsx";

import { type NestedApiDetail, type FullApiDetail, type DetailEntityType } from "~/prisma/model";
import { IconButton, Link } from "~/components/buttons";
import { TimelineIcon } from "~/components/icons/TimelineIcon";
import { DetailsTimeline } from "~/components/timelines/DetailsTimeline";
import { type ComponentProps } from "~/components/types";
import { Text } from "~/components/typography/Text";
import { useDeepEqualEffect } from "~/hooks";

import { CreateNestedDetailForm, CreateDetailForm } from "./create";
import { UpdateDetailForm } from "./UpdateDetailForm";

type ModifyNestedDetailsTimelineProps = ComponentProps & {
  readonly details: NestedApiDetail[];
  readonly detailId: string;
  readonly isCreating: boolean;
  readonly onSucessCreate: () => void;
  readonly onCancelCreate: () => void;
};

const ModifyNestedDetailsTimeline = ({
  details,
  detailId,
  isCreating,
  onSucessCreate,
  onCancelCreate,
  ...props
}: ModifyNestedDetailsTimelineProps): JSX.Element => {
  const [optimisticDetails, setOptimisticDetails] = useState<NestedApiDetail[]>(details);

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
            onCancel={() => onCancelCreate()}
            onCreated={detail => {
              setOptimisticDetails(curr => [{ ...detail, nestedDetails: [] }, ...curr]);
              onSucessCreate();
            }}
          />
        </Timeline.Item>
      )}
      {...optimisticDetails.map((detail, i) => (
        <Timeline.Item key={i + 1} bullet={<TimelineIcon />}>
          <UpdateDetailForm
            key={detail.id}
            detail={detail}
            onDeleted={() => setOptimisticDetails(curr => curr.filter(d => d.id !== detail.id))}
          />
        </Timeline.Item>
      ))}
    </DetailsTimeline>
  );
};

interface ModifyFullDetailTimelineProps {
  readonly detail: FullApiDetail;
  readonly onDeleted: () => void;
}

const ModifyFullDetailTimeline = ({ detail, onDeleted }: ModifyFullDetailTimelineProps) => {
  const [createFormVisible, setCreateFormVisible] = useState(false);

  return (
    <div className="relative flex flex-col gap-[10px]">
      <UpdateDetailForm
        detail={detail}
        actions={[
          <IconButton.Bare
            key="0"
            className="text-blue-700 hover:text-blue-800"
            icon={{ name: "plus-circle" }}
            isDisabled={createFormVisible}
            onClick={() => setCreateFormVisible(true)}
          />,
        ]}
        onDeleted={onDeleted}
      />
      {(createFormVisible || detail.nestedDetails.length > 0) && (
        <ModifyNestedDetailsTimeline
          details={detail.nestedDetails}
          detailId={detail.id}
          isCreating={createFormVisible}
          onCancelCreate={() => setCreateFormVisible(false)}
          onSucessCreate={() => setCreateFormVisible(false)}
        />
      )}
    </div>
  );
};

export interface ModifyDetailsTimelineProps extends ComponentProps {
  readonly details: FullApiDetail[];
  readonly entityId: string;
  readonly entityType: DetailEntityType;
}

export const ModifyDetailsView = ({
  details,
  entityId,
  entityType,
  ...props
}: ModifyDetailsTimelineProps): JSX.Element => {
  const [createFormVisible, setCreateFormVisible] = useState(false);
  const [optimisticDetails, setOptimisticDetails] = useState<FullApiDetail[]>(details);

  useDeepEqualEffect(() => {
    setOptimisticDetails(details);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [details]);

  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex flex-row justify-between items-center">
        <Text size="sm" fontWeight="medium">{`${details.length} Details`}</Text>
        <Link.Primary
          className="text-blue-700 hover:text-blue-800"
          fontSize="sm"
          fontWeight="regular"
          isDisabled={createFormVisible}
          onClick={() => setCreateFormVisible(true)}
        >
          Add
        </Link.Primary>
      </div>
      <DetailsTimeline {...props} className={clsx("h-full max-h-full w-full", props.className)}>
        <Timeline.Item key="0" hidden={!createFormVisible} bullet={<TimelineIcon />}>
          <CreateDetailForm
            key="new-detail"
            entityId={entityId}
            entityType={entityType}
            onCancel={() => setCreateFormVisible(false)}
            onCreated={detail => {
              setOptimisticDetails(curr => [{ ...detail, nestedDetails: [] }, ...curr]);
              setCreateFormVisible(false);
            }}
          />
        </Timeline.Item>
        {...optimisticDetails.map((detail, i) => (
          <Timeline.Item key={i + 1} bullet={<TimelineIcon />}>
            <ModifyFullDetailTimeline
              detail={detail}
              onDeleted={() => setOptimisticDetails(curr => curr.filter(d => d.id !== detail.id))}
            />
          </Timeline.Item>
        ))}
      </DetailsTimeline>
    </div>
  );
};

export default ModifyDetailsView;
