"use client";
import { useState } from "react";

import clsx from "clsx";

import { type NestedDetail, type FullDetail, type DetailEntityType } from "~/prisma/model";
import { IconButton, Link } from "~/components/buttons";
import { DetailsTimeline } from "~/components/timelines/DetailsTimeline";
import { type ComponentProps } from "~/components/types";
import { Text } from "~/components/typography/Text";
import { useDeepEqualEffect } from "~/hooks";

import { CreateNestedDetailForm, CreateDetailForm } from "./create";
import { UpdateDetailForm } from "./UpdateDetailForm";

type ModifyNestedDetailsTimelineProps = ComponentProps & {
  readonly details: NestedDetail[];
  readonly detailId: string;
  readonly isCreating: boolean;
  readonly onCancelCreate: () => void;
};

const ModifyNestedDetailsTimeline = ({
  details,
  detailId,
  isCreating,
  onCancelCreate,
  ...props
}: ModifyNestedDetailsTimelineProps): JSX.Element => {
  const [optimisticDetails, setOptimisticDetails] = useState<NestedDetail[]>(details);

  useDeepEqualEffect(() => {
    setOptimisticDetails(details);
  }, [details]);

  return (
    <DetailsTimeline {...props} className={clsx("h-full max-h-full w-full", props.className)}>
      {isCreating && (
        <CreateNestedDetailForm
          key="new-detail"
          detailId={detailId}
          onCancel={() => onCancelCreate()}
        />
      )}
      {...optimisticDetails.map(detail => (
        <UpdateDetailForm
          key={detail.id}
          detail={detail}
          onDeleted={() => setOptimisticDetails(curr => curr.filter(d => d.id !== detail.id))}
        />
      ))}
    </DetailsTimeline>
  );
};

interface ModifyFullDetailTimelineProps {
  readonly detail: FullDetail;
  readonly onDeleted: () => void;
}

const ModifyFullDetailTimeline = ({ detail, onDeleted }: ModifyFullDetailTimelineProps) => {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="relative flex flex-col gap-[10px]">
      <UpdateDetailForm
        detail={detail}
        actions={[
          <IconButton.Bare
            key="0"
            className="text-blue-700 hover:text-blue-800"
            icon={{ name: "plus-circle" }}
            isDisabled={isCreating}
            onClick={() => setIsCreating(true)}
          />,
        ]}
        onDeleted={onDeleted}
      />
      {(isCreating || detail.nestedDetails.length > 0) && (
        <ModifyNestedDetailsTimeline
          details={detail.nestedDetails}
          detailId={detail.id}
          isCreating={isCreating}
          onCancelCreate={() => setIsCreating(false)}
        />
      )}
    </div>
  );
};

export interface ModifyDetailsTimelineProps extends ComponentProps {
  readonly details: FullDetail[];
  readonly entityId: string;
  readonly entityType: DetailEntityType;
}

export const ModifyDetailsTimeline = ({
  details,
  entityId,
  entityType,
  ...props
}: ModifyDetailsTimelineProps): JSX.Element => {
  const [isCreating, setIsCreating] = useState(false);

  const [optimisticDetails, setOptimisticDetails] = useState<FullDetail[]>(details);

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
          isDisabled={isCreating}
          onClick={() => setIsCreating(true)}
        >
          Add
        </Link.Primary>
      </div>
      <DetailsTimeline {...props} className={clsx("h-full max-h-full w-full", props.className)}>
        {isCreating && (
          <CreateDetailForm
            key="new-detail"
            entityId={entityId}
            entityType={entityType}
            onCancel={() => setIsCreating(false)}
          />
        )}
        {...optimisticDetails.map(detail => (
          <ModifyFullDetailTimeline
            key={detail.id}
            detail={detail}
            onDeleted={() => setOptimisticDetails(curr => curr.filter(d => d.id !== detail.id))}
          />
        ))}
      </DetailsTimeline>
    </div>
  );
};

export default ModifyDetailsTimeline;
