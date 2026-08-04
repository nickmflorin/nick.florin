import { type JSX, type MouseEvent } from 'react';

import { type FileError } from 'react-dropzone-esm';

import { IconButton, Link } from '~/components/buttons';
import { Icon } from '~/components/icons/Icon';
import { Spinner } from '~/components/icons/Spinner';
import { type Action, Actions } from '~/components/structural/Actions';
import { classNames, type ComponentProps } from '~/components/types';
import { Description, Label, Text } from '~/components/typography';
import { DateTimeText } from '~/components/typography/DateTimeText';
import { FileSize } from '~/components/typography/FileSize';
import { PipedText } from '~/components/typography/PipedText';

import * as types from './types';

const UploadTileError = ({
  error,
}: {
  readonly error: FileError | FileError[] | string | string[];
}) =>
  Array.isArray(error) ? (
    <div className='flex flex-col gap-[4px]'>
      {error.map((e, index) => (
        <UploadTileError error={e} key={index} />
      ))}
    </div>
  ) : (
    <div className='flex flex-row items-center gap-[4px]'>
      <Icon className='text-red-400' icon='circle-exclamation' size='14px' />
      <Description fontSize='xs'>{typeof error === 'string' ? error : error.message}</Description>
    </div>
  );

export type UploadTileRendererProps<M extends types.BaseUploadModel> = {
  readonly manager: types.UploadsManager<M>;
  readonly upload: types.Upload<M>;
};

export interface UploadTileProps<M extends types.BaseUploadModel>
  extends ComponentProps, UploadTileRendererProps<M> {
  readonly actions?: Action[];
}

export const UploadTile = <M extends types.BaseUploadModel>({
  actions,
  manager,
  upload,
  ...props
}: UploadTileProps<M>): JSX.Element => (
  <div
    {...props}
    className={classNames(
      'relative p-[8px] border rounded-md',
      { 'opacity-50': upload.state === 'uploading' },
      props.className,
    )}
  >
    <div className='flex flex-col gap-[4px]'>
      <div className='flex flex-row w-full justify-between items-center'>
        <div className='flex flex-row gap-[8px] items-center'>
          <Icon className='text-gray-600' icon='file-pdf' size='14px' />
          {types.isUploadOfState(upload, ['existing', 'uploaded']) ? (
            <Link
              className='leading-[18px]'
              element='a'
              fontSize='xs'
              href={upload.model.url}
              openInNewTab
            >
              {upload.model.filename}
            </Link>
          ) : (
            <Label className='leading-[18px]' fontSize='xs' fontWeight='medium'>
              {upload.file.name}
            </Label>
          )}
        </div>
        <Actions
          actions={[
            ...(actions ?? []),
            types.isUploadOfState(upload, ['failed']) ? (
              <IconButton.Transparent
                className={classNames(
                  'text-gray-500 hover:text-gray-600',
                  'h-[20px] w-[20px] min-h-[20px]',
                )}
                icon={{ name: 'xmark' }}
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  manager.dismissFailedUpload(upload.uploadId);
                }}
                size='xsmall'
              />
            ) : null,
            types.isUploadOfState(upload, ['rejected']) ? (
              <IconButton.Transparent
                className={classNames(
                  'text-gray-500 hover:text-gray-600',
                  'h-[20px] w-[20px] min-h-[20px]',
                )}
                icon={{ name: 'xmark' }}
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  manager.dismissRejectedUpload(upload.uploadId);
                }}
                size='xsmall'
              />
            ) : null,
          ]}
        />
      </div>
      <div className='flex flex-col gap-[6px] pl-[22px]'>
        <PipedText>
          <FileSize
            fileSize={
              types.isUploadOfState(upload, ['existing', 'uploaded'])
                ? upload.model.size
                : upload.file.size
            }
          />
          {types.isUploadOfState(upload, ['uploading']) ? (
            <div className='flex flex-row gap-[4px] items-center'>
              <Spinner className='text-gray-500' />
              <Description fontSize='xs'>Uploading...</Description>
            </div>
          ) : types.isUploadOfState(upload, ['existing', 'uploaded']) ? (
            <Text fontSize='sm'>
              Uploaded&nbsp;
              <DateTimeText inherit value={upload.model.createdAt} />
            </Text>
          ) : null}
        </PipedText>
        {types.isUploadOfState(upload, ['failed', 'rejected']) ? (
          <UploadTileError error={upload.errors} />
        ) : null}
      </div>
    </div>
  </div>
);
