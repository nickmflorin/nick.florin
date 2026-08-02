import { Fragment, type JSX } from 'react';

import { classNames, type ComponentProps } from '~/components/types';

import * as types from './types';
import { UploadTile, type UploadTileProps, type UploadTileRendererProps } from './UploadTile';

export interface UploadsProps<M extends types.BaseUploadModel>
  extends ComponentProps, Omit<UploadTileProps<M>, 'actions' | 'onDismiss' | 'upload'> {
  readonly children?: (props: UploadTileRendererProps<M>) => JSX.Element;
  readonly manager: types.UploadsManager<M>;
}

export const Uploads = <M extends types.BaseUploadModel>({
  children,
  manager,
  ...props
}: UploadsProps<M>) => (
  <div
    {...props}
    className={classNames('relative w-full flex flex-col gap-[4px]', props.className)}
  >
    {manager.uploads.map(upload => {
      const key = types.isUploadOfState(upload, ['existing', 'uploaded'])
        ? upload.model.id
        : upload.uploadId;
      return typeof children === 'function' ? (
        <Fragment key={key}>{children({ manager, upload })}</Fragment>
      ) : (
        <UploadTile key={key} manager={manager} upload={upload} />
      );
    })}
  </div>
);
