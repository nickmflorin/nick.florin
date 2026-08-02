import { Icon } from '~/components/icons/Icon';
import { classNames, type ComponentProps } from '~/components/types';
import { Text } from '~/components/typography';

export interface UploadDropzoneContentProps extends ComponentProps {}

export const UploadDropzoneContent = (props: UploadDropzoneContentProps) => (
  <div {...props} className={classNames('flex flex-row gap-[12px] items-center', props.className)}>
    <Icon className='text-gray-600' icon='image' size='28px' />
    <Text className='text-body' fontSize='sm'>
      Drag files here or click to upload.
    </Text>
  </div>
);
