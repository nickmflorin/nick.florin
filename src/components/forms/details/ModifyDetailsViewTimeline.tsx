"use client";
import { useEffect, useState } from "react";

import clsx from "clsx";

import {
  type NestedDetail,
  type FullDetail,
  isFullDetail,
  type DetailEntityType,
} from "~/prisma/model";
import { IconButton, Link } from "~/components/buttons";
import { DetailsTimeline } from "~/components/timelines/DetailsTimeline";
import { type ComponentProps } from "~/components/types";
import { Text } from "~/components/typography/Text";
import { useDeepEqualEffect } from "~/hooks";

import { CreateNestedDetailForm, CreateDetailForm } from "./create";
import { UpdateDetailForm } from "./UpdateDetailForm";

interface ModifyFullDetailTimelineProps {
  readonly detail: FullDetail;
  readonly onDeleted: () => void;
}

const ModifyFullDetailTimeline = ({ detail, onDeleted }: ModifyFullDetailTimelineProps) => {
  const [isCreating, setIsCreating] = useState(false);

  const [optimisticDetails, setOptimisticDetails] = useState<NestedDetail[]>(detail.nestedDetails);

  useDeepEqualEffect(() => {
    console.log("SETTING OPTIMISTIC in CHILD");
    setOptimisticDetails(detail.nestedDetails);
  }, [detail.nestedDetails]);

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
      {(isCreating || optimisticDetails.length > 0) && (
        <ModifyDetailsTimeline
          details={optimisticDetails}
          isNested={true}
          detailId={detail.id}
          isCreating={isCreating}
          onCancelCreate={() => setIsCreating(false)}
          onDeleted={() => setOptimisticDetails(curr => curr.filter(d => d.id !== detail.id))}
        />
      )}
    </div>
  );
};

type ModifyNestedDetailsTimelineProps = ComponentProps & {
  readonly details: NestedDetail[];
  readonly isNested: true;
  readonly entityId?: never;
  readonly entityType?: never;
  readonly detailId: string;
  readonly isCreating?: boolean;
  readonly onCancelCreate: () => void;
  readonly onDeleted: () => void;
};

type ModifyDetailsTimelinePrimaryProps = ComponentProps & {
  readonly details: FullDetail[];
  readonly isNested?: never;
  readonly entityId: string;
  readonly detailId?: never;
  readonly entityType: DetailEntityType;
  readonly isCreating?: never;
  readonly onCancelCreate?: never;
  readonly onDeleted?: never;
};

export type ModifyDetailsTimelineProps =
  | ModifyDetailsTimelinePrimaryProps
  | ModifyNestedDetailsTimelineProps;

const ModifyNestedDetailsTimeline = ({
  details,
  entityId,
  entityType,
  isNested,
  detailId,
  isCreating: _propIsCreating,
  onDeleted,
  onCancelCreate,
  ...props
}: ModifyNestedDetailsTimelineProps): JSX.Element => {
  const [isCreating, setIsCreating] = useState(false);

  const [optimisticDetails, setOptimisticDetails] =
    useState<(FullDetail | NestedDetail)[]>(details);

  useDeepEqualEffect(() => {
    // Optimistic details for nested timelines are handled in the child timeline component above.
    if (!isNested) {
      setOptimisticDetails(details);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [details]);

  return (
    <div className="flex flex-col gap-[12px]">
      {!isNested && (
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
      )}
      <DetailsTimeline {...props} className={clsx("h-full max-h-full w-full", props.className)}>
        {isNested && _propIsCreating && (
          <CreateNestedDetailForm detailId={detailId} onCancel={() => onCancelCreate()} />
        )}
        {!isNested && isCreating && (
          <CreateDetailForm
            entityId={entityId}
            entityType={entityType}
            onCancel={() => setIsCreating(false)}
          />
        )}
        {...optimisticDetails.map(detail => {
          if (isFullDetail(detail)) {
            return (
              <ModifyFullDetailTimeline
                key={detail.id}
                detail={detail}
                onDeleted={() => setOptimisticDetails(curr => curr.filter(d => d.id !== detail.id))}
              />
            );
          }
          /* Note: The only reason TS does not pick up on the fact that 'onDeleted' cannot be
               undefined here is because we are checking 'isFullDetail(detail)' instead of 'isNested',
               which is the differentiator between the two types of props.  However, if we were to
               check 'isNested', we wouldn't have to do the ?. coercion here, but we would have to
               coerce the type of 'detail', because TS would not be able to infer that 'detail' is
               a 'NestedDetail' and not a 'FullDetail' in the case that 'isNested' is true - because
               of the map operation. */
          if (!isNested || onDeleted === undefined) {
            throw new TypeError(
              "Unexpected condition: At this point, the 'onDeleted' prop should be defined.",
            );
          }
          return (
            <UpdateDetailForm key={detail.id} detail={detail} onDeleted={() => onDeleted?.()} />
          );
        })}
      </DetailsTimeline>
    </div>
  );
};

export const ModifyDetailsTimeline = ({
  details,
  entityId,
  entityType,
  isNested,
  detailId,
  isCreating: _propIsCreating,
  onDeleted,
  onCancelCreate,
  ...props
}: ModifyDetailsTimelineProps): JSX.Element => {
  const [isCreating, setIsCreating] = useState(false);

  const [optimisticDetails, setOptimisticDetails] =
    useState<(FullDetail | NestedDetail)[]>(details);

  useDeepEqualEffect(() => {
    // Optimistic details for nested timelines are handled in the child timeline component above.
    if (!isNested) {
      setOptimisticDetails(details);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [details]);

  return (
    <div className="flex flex-col gap-[12px]">
      {!isNested && (
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
      )}
      <DetailsTimeline {...props} className={clsx("h-full max-h-full w-full", props.className)}>
        {isNested && _propIsCreating && (
          <CreateNestedDetailForm detailId={detailId} onCancel={() => onCancelCreate()} />
        )}
        {!isNested && isCreating && (
          <CreateDetailForm
            entityId={entityId}
            entityType={entityType}
            onCancel={() => setIsCreating(false)}
          />
        )}
        {...optimisticDetails.map(detail => {
          if (isFullDetail(detail)) {
            return (
              <ModifyFullDetailTimeline
                key={detail.id}
                detail={detail}
                onDeleted={() => setOptimisticDetails(curr => curr.filter(d => d.id !== detail.id))}
              />
            );
          }
          /* Note: The only reason TS does not pick up on the fact that 'onDeleted' cannot be
             undefined here is because we are checking 'isFullDetail(detail)' instead of 'isNested',
             which is the differentiator between the two types of props.  However, if we were to
             check 'isNested', we wouldn't have to do the ?. coercion here, but we would have to
             coerce the type of 'detail', because TS would not be able to infer that 'detail' is
             a 'NestedDetail' and not a 'FullDetail' in the case that 'isNested' is true - because
             of the map operation. */
          if (!isNested || onDeleted === undefined) {
            throw new TypeError(
              "Unexpected condition: At this point, the 'onDeleted' prop should be defined.",
            );
          }
          return (
            <UpdateDetailForm key={detail.id} detail={detail} onDeleted={() => onDeleted?.()} />
          );
        })}
      </DetailsTimeline>
    </div>
  );
};

export default ModifyDetailsTimeline;
