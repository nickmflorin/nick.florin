import { useEffect } from 'react';

import type * as types from './types';

import { type ApiError } from '~/api';

import { ApiResponseState } from '~/components/ApiResponseState';
import { useManagedUploads } from '~/components/uploads/hooks';

import {
  ManagedUploadsContainer,
  type ManagedUploadsContainerProps,
} from './ManagedUploadsContainer';
import { Uploads, type UploadsProps } from './Uploads';

export interface ManagedUploadsProps<M extends types.BaseUploadModel>
  extends
    Omit<ManagedUploadsContainerProps<M>, 'children' | 'manager'>,
    Pick<UploadsProps<M>, 'children'> {
  readonly data: M[];
  readonly error?: ApiError | null | string;
  readonly isLoading?: boolean;
  readonly uploadAction: types.UploadAction<M>;
}

export const ManagedUploads = <M extends types.BaseUploadModel>({
  children,
  data,
  error = null,
  isLoading = false,
  uploadAction,
  ...props
}: ManagedUploadsProps<M>) => {
  const { sync, uploads, ...manager } = useManagedUploads<M>({
    initialData: data,
    uploadAction,
  });

  useEffect(() => {
    sync(data);
  }, [data, sync]);

  return (
    <ManagedUploadsContainer {...props} manager={manager}>
      <ApiResponseState error={error} isLoading={isLoading}>
        <Uploads<M> manager={{ ...manager, sync, uploads }}>{children}</Uploads>
      </ApiResponseState>
    </ManagedUploadsContainer>
  );
};
