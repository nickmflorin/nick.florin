import { type JSX } from 'react';

import { isUuid } from '~/lib/typeguards';

import { ApiResponseState } from '~/components/ApiResponseState';
import { ExpandedUpdateDetailForm } from '~/features/resume/components/forms/update/ExpandedUpdateDetailForm';
import { useDetail } from '~/hooks/api';

interface UpdateDetailExpandedDrawerProps {
  readonly detailId: string;
  readonly isNested: boolean;
}

export const UpdateDetailExpandedDrawer = ({
  detailId,
  isNested,
}: UpdateDetailExpandedDrawerProps): JSX.Element => {
  const { data, error, isLoading } = useDetail(
    isUuid(detailId) ? { id: detailId, isNested } : null,
    {
      keepPreviousData: true,
      query: { includes: ['skills', 'nestedDetails'], visibility: 'admin' },
    },
  );
  return (
    <ApiResponseState data={data} error={error} isLoading={isLoading}>
      {detail => <ExpandedUpdateDetailForm detail={detail} isExpanded />}
    </ApiResponseState>
  );
};
