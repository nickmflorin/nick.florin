import dynamic from 'next/dynamic';
import { type JSX, useState } from 'react';

import {
  type ApiDetail,
  type ApiNestedDetail,
  type DetailEntityType,
  isNestedDetail,
} from '~/database/model';

import { IconButton } from '~/components/buttons';
import { type ExtendingDrawerProps } from '~/components/drawers';
import { ContextDrawer } from '~/components/drawers/ContextDrawer';
import { Loading } from '~/components/loading/Loading';
import { Title } from '~/components/typography';

const UpdateDetailsCollapsedDrawer = dynamic(
  () => import('./UpdateDetailsCollapsedDrawer').then(mod => mod.UpdateDetailsCollapsedDrawer),
  {
    loading: () => <Loading isLoading />,
  },
);

const UpdateDetailsExpandedDrawer = dynamic(
  () => import('./UpdateDetailsExpandedDrawer').then(mod => mod.UpdateDetailExpandedDrawer),
  {
    loading: () => <Loading isLoading />,
  },
);

export interface UpdateDetailsDrawerProps<T extends DetailEntityType> extends ExtendingDrawerProps {
  readonly entityId: string;
  readonly entityType: T;
}

export const UpdateDetailsDrawer = <T extends DetailEntityType>({
  entityId,
  entityType,
}: UpdateDetailsDrawerProps<T>): JSX.Element => {
  const [expandedDetail, setExpandedDetail] = useState<ApiDetail<[]> | ApiNestedDetail<[]> | null>(
    null,
  );
  return (
    <ContextDrawer>
      {expandedDetail ? (
        <>
          <ContextDrawer.Header>
            <div className='flex flex-row items-center gap-[8px]'>
              <IconButton.Transparent
                icon={{ name: 'arrow-left' }}
                onClick={() => setExpandedDetail(null)}
                scheme='light'
              />
              <Title component='h4'>{expandedDetail.label}</Title>
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
          entityId={entityId}
          entityType={entityType}
          onExpand={detail => setExpandedDetail(detail)}
        />
      )}
    </ContextDrawer>
  );
};
