import { type MouseEvent, useState } from 'react';

import { toast } from 'react-toastify';

import { type BrandResume } from '~/database/model';
import { logger } from '~/internal/logger';

import { deleteResume } from '~/actions/resumes/delete-resume';
import { updateResume } from '~/actions/resumes/update-resume';

import { Icon } from '~/components/icons/Icon';
import { Menu } from '~/components/menus/Menu';
import { type UploadsManager } from '~/components/uploads';

export interface UploadResumeMenuProps {
  readonly manager: UploadsManager<BrandResume>;
  readonly onClose: (e: MouseEvent<HTMLDivElement>) => void;
  readonly resume: BrandResume;
}

/**
 * Syncs the given {@link UploadsManager} with the resumes returned from a delete, since deleting a
 * resume may change which resume is exposed as the primary download.
 */
const syncManagerAfterDelete = (manager: UploadsManager<BrandResume>, resumes: BrandResume[]) =>
  manager.sync(resumes);

export const UploadResumeMenu = ({ manager, onClose, resume }: UploadResumeMenuProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <Menu>
      <Menu.Content>
        <Menu.Item
          height='34px'
          icon='download'
          onClick={e => {
            window.open(resume.downloadUrl, '_blank');
            onClose(e);
          }}
        >
          Download
        </Menu.Item>
        <Menu.Item
          height='34px'
          icon={
            <Icon
              className='text-green-700'
              icon='check'
              iconStyle='solid'
              isLoading={isUpdating}
              key='0'
              size='14px'
              spinnerClassName='text-gray-600'
            />
          }
          isDisabled={resume.primary}
          isLocked={isUpdating}
          onClick={async e => {
            setIsUpdating(true);
            let response: Awaited<ReturnType<typeof updateResume>> | null = null;
            try {
              response = await updateResume(resume.id, { primary: true });
            } catch (err) {
              logger.errorUnsafe(
                err,
                `There was an error prioritizing the resume '${resume.id}'.}`,
                { resume: resume.id },
              );
              setIsUpdating(false);
              return toast.error('There was an error prioritizing the resume.');
            }
            setIsUpdating(false);
            const { data, error } = response;
            if (error) {
              logger.error(error, `There was an error prioritizing the resume '${resume.id}'.}`, {
                resume: resume.id,
              });
              setIsUpdating(false);
              return toast.error('There was an error prioritizing the resume.');
            }
            onClose(e);
            return manager.sync(data.resumes);
          }}
        >
          Set as Primary
        </Menu.Item>
        <Menu.Item
          height='34px'
          icon={
            <Icon
              className='text-red-500'
              icon={{ name: 'trash-alt' }}
              isLoading={isDeleting}
              size='14px'
              spinnerClassName='text-gray-600'
            />
          }
          isLocked={isDeleting}
          onClick={async e => {
            e.stopPropagation();
            setIsDeleting(true);
            let response: Awaited<ReturnType<typeof deleteResume>> | null = null;
            try {
              response = await deleteResume(resume.id);
            } catch (err) {
              logger.errorUnsafe(
                err,
                `There was an error deleting the resume '${resume.filename}'.`,
                { id: resume.id, resume },
              );
              setIsDeleting(false);
              return toast.error(`There was an error deleting the resume '${resume.filename}'.`);
            }
            setIsDeleting(false);

            const { data, error } = response;
            if (error) {
              logger.error(error, `There was an error deleting the resume '${resume.filename}'.`, {
                id: resume.id,
                resume,
              });
              return toast.error(`There was an error deleting the resume '${resume.filename}'.`);
            }
            onClose(e);
            return syncManagerAfterDelete(manager, data);
          }}
        >
          Delete
        </Menu.Item>
      </Menu.Content>
    </Menu>
  );
};
