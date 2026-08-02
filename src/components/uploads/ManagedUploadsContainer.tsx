import dynamic from 'next/dynamic';
import { type JSX } from 'react';

import { type FileWithPath } from 'react-dropzone-esm';

import type * as types from './types';

import { classNames, type ComponentProps } from '~/components/types';

import { UploadDropzonePlaceholder } from './dropzone/UploadDropzonePlaceholder';

const UploadDropzone = dynamic(
  () => import('./dropzone/UploadDropzone').then(mod => mod.UploadDropzone),
  {
    loading: () => <UploadDropzonePlaceholder />,
  },
);

export interface ManagedUploadsContainerProps<M extends types.BaseUploadModel> extends Omit<
  types.UploadDropzoneProps,
  'onDrop' | 'onReject'
> {
  readonly children: JSX.Element;
  readonly dropzoneClassName?: ComponentProps['className'];
  readonly manager: Omit<types.UploadsManager<M>, 'sync' | 'uploads'>;
}

export const ManagedUploadsContainer = <M extends types.BaseUploadModel>({
  children,
  className,
  dropzoneClassName,
  manager,
  style,
  ...props
}: ManagedUploadsContainerProps<M>) => (
  <div
    className={classNames(
      'flex flex-col gap-[12px] h-full max-h-full overflow-y-hidden',
      className,
    )}
    style={style}
  >
    <div
      className='relative flex flex-col overflow-y-auto grow'
      style={{ maxHeight: 'calc(100% - 60px)' }}
    >
      {children}
    </div>
    <UploadDropzone
      {...props}
      className={dropzoneClassName}
      isDisabled={manager.isUploading || props.isDisabled}
      isLoading={manager.isUploading}
      onDrop={(files: FileWithPath[]) => manager.performUpload(files)}
      onReject={files => manager.addRejectedFiles(files)}
    />
  </div>
);
