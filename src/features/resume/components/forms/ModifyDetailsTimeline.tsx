import { type JSX, useState } from 'react';

import { Timeline } from '@mantine/core';
import { isEqual } from 'lodash-es';

import { type ApiDetail, type ApiNestedDetail } from '~/database/model';

import { TimelineIcon } from '~/components/icons/TimelineIcon';
import { classNames, type ComponentProps } from '~/components/types';
import { DetailsTimeline } from '~/features/resume/components/DetailsTimeline';

import { CreateDetailForm, type CreateDetailFormProps } from './create';
import { ModifyDetailView } from './ModifyDetailView';

export interface ModifyDetailsTimelineProps
  extends
    ComponentProps,
    Pick<CreateDetailFormProps, 'entityId' | 'entityType' | 'onCancel' | 'onCreated'> {
  readonly details: ApiDetail<['nestedDetails', 'skills']>[];
  readonly isCreateFormVisible: boolean;
  readonly onExpand: (detail: ApiDetail<[]> | ApiNestedDetail<[]>) => void;
}

export const ModifyDetailsTimeline = ({
  details,
  entityId,
  entityType,
  isCreateFormVisible,
  onCancel,
  onCreated,
  onExpand,
  ...props
}: ModifyDetailsTimelineProps): JSX.Element => {
  const [optimisticDetails, setOptimisticDetails] =
    useState<ApiDetail<['nestedDetails', 'skills']>[]>(details);
  const [syncedDetails, setSyncedDetails] =
    useState<ApiDetail<['nestedDetails', 'skills']>[]>(details);

  /* The optimistic details are re-seeded during render, rather than from an effect, whenever the
     details provided to the component change.  React applies a state update performed during render
     before it commits, so this avoids the additional committed render that an effect would cause.
     The comparison is by value because the details are re-created on each render of the parent. */
  if (!isEqual(details, syncedDetails)) {
    setSyncedDetails(details);
    setOptimisticDetails(details);
  }

  return (
    <DetailsTimeline {...props} className={classNames('h-full max-h-full w-full', props.className)}>
      <Timeline.Item bullet={<TimelineIcon />} hidden={!isCreateFormVisible} key='0'>
        <CreateDetailForm
          entityId={entityId}
          entityType={entityType}
          key='new-detail'
          onCancel={onCancel}
          onCreated={detail => {
            setOptimisticDetails(curr => [{ ...detail, nestedDetails: [] }, ...curr]);
            onCreated(detail);
          }}
        />
      </Timeline.Item>
      {...optimisticDetails.map((detail, i) => (
        <Timeline.Item bullet={<TimelineIcon />} key={i + 1}>
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
