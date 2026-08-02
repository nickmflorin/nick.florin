import { type BrandResume } from '~/database/model';

import { Icon } from '~/components/icons/Icon';
import * as types from '~/components/uploads/types';
import { UploadTile, type UploadTileProps } from '~/components/uploads/UploadTile';

import { UploadResumeDropdownMenu } from '../UploadResumeDropdownMenu';

export interface UploadResumeTileProps extends Omit<UploadTileProps<BrandResume>, 'actions'> {}

export const UploadResumeTile = ({ upload, ...props }: UploadResumeTileProps) => (
  <UploadTile
    {...props}
    actions={[
      types.isUploadOfState(upload, ['uploaded', 'existing']) && upload.model.primary === true ? (
        <Icon className='text-green-700' icon='check' iconStyle='solid' key='0' size='14px' />
      ) : null,
      types.isUploadOfState(upload, ['uploaded', 'existing']) ? (
        <UploadResumeDropdownMenu key='2' manager={props.manager} resume={upload.model} />
      ) : null,
    ]}
    upload={upload}
  />
);
