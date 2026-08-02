import { type JSX } from 'react';

import { type ApiDetail, type ApiNestedDetail, type DetailEntityType } from '~/database/model';

import { ApiResponseState } from '~/components/ApiResponseState';
import { ContextDrawer } from '~/components/drawers/ContextDrawer';
import { ModifyDetailsView } from '~/features/resume/components/forms/ModifyDetailsView';
import { useDetails } from '~/hooks/api';

export interface UpdateDetailsCollapsedDrawerProps<T extends DetailEntityType> {
  readonly entityId: string;
  readonly entityType: T;
  readonly onExpand: (detail: ApiDetail<[]> | ApiNestedDetail<[]>) => void;
}

export const UpdateDetailsCollapsedDrawer = <T extends DetailEntityType>(
  props: UpdateDetailsCollapsedDrawerProps<T>,
): JSX.Element => {
  const { data, error, isLoading } = useDetails(props.entityId, props.entityType, {
    keepPreviousData: true,
    query: { includes: ['nestedDetails', 'skills'], visibility: 'admin' },
  });
  return (
    <ApiResponseState data={data} error={error} isLoading={isLoading}>
      {obj => {
        const title = obj.entity.$kind === 'education' ? obj.entity.major : obj.entity.title;
        return (
          <>
            <ContextDrawer.Header>{title}</ContextDrawer.Header>
            <ContextDrawer.Content className='pr-[18px]'>
              <ModifyDetailsView {...props} details={obj.details} />
            </ContextDrawer.Content>
          </>
        );
      }}
    </ApiResponseState>
  );
};
