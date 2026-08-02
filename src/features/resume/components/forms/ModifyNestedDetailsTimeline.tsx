import { type JSX, useState } from 'react';

import { Timeline } from '@mantine/core';
import { isEqual } from 'lodash-es';

import { type ApiNestedDetail } from '~/database/model';

import { TimelineIcon } from '~/components/icons/TimelineIcon';
import { classNames, type ComponentProps } from '~/components/types';
import { DetailsTimeline } from '~/features/resume/components/DetailsTimeline';

import { CreateNestedDetailForm, type CreateNestedDetailFormProps } from './create';
import { CollapsedUpdateDetailForm } from './update/CollapsedUpdateDetailForm';

export interface ModifyNestedDetailsTimelineProps
  extends ComponentProps, Pick<CreateNestedDetailFormProps, 'detailId' | 'onCancel' | 'onCreated'> {
  readonly details: ApiNestedDetail<['skills']>[];
  readonly isCreating: boolean;
  readonly onExpand: (detail: ApiNestedDetail<['skills']>) => void;
}

export const ModifyNestedDetailsTimeline = ({
  detailId,
  details,
  isCreating,
  onCancel,
  onCreated,
  onExpand,
  ...props
}: ModifyNestedDetailsTimelineProps): JSX.Element => {
  const [optimisticDetails, setOptimisticDetails] =
    useState<ApiNestedDetail<['skills']>[]>(details);
  const [syncedDetails, setSyncedDetails] = useState<ApiNestedDetail<['skills']>[]>(details);

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
      {isCreating && (
        <Timeline.Item bullet={<TimelineIcon />} hidden={!isCreating} key='0'>
          <CreateNestedDetailForm
            detailId={detailId}
            key='new-detail'
            onCancel={onCancel}
            onCreated={detail => {
              setOptimisticDetails(curr => [{ ...detail, nestedDetails: [] }, ...curr]);
              onCreated(detail);
            }}
          />
        </Timeline.Item>
      )}
      {...optimisticDetails.map((detail, i) => (
        <Timeline.Item bullet={<TimelineIcon />} key={i + 1}>
          <CollapsedUpdateDetailForm
            detail={detail}
            isExpanded={false}
            key={detail.id}
            onDeleted={() => setOptimisticDetails(curr => curr.filter(d => d.id !== detail.id))}
            onExpand={() => onExpand(detail)}
          />
        </Timeline.Item>
      ))}
    </DetailsTimeline>
  );
};
