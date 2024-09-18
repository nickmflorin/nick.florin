import { useState } from "react";

import { toast } from "react-toastify";

import type { BrandResume } from "~/database/model";
import { logger } from "~/internal/logger";

import { deleteResume, prioritizeResume } from "~/actions/mutations/resumes";
import { isApiClientGlobalErrorJson } from "~/api";

import { Icon } from "~/components/icons/Icon";
import { Menu } from "~/components/menus/Menu";
import type { UploadsManager } from "~/components/uploads";

export interface UploadResumeMenuProps {
  readonly manager: UploadsManager<BrandResume>;
  readonly resume: BrandResume;
  readonly onClose: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const UploadResumeMenu = ({ manager, resume, onClose }: UploadResumeMenuProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <Menu>
      <Menu.Content>
        <Menu.Item
          height="34px"
          icon="download"
          onClick={e => {
            window.open(resume.downloadUrl, "_blank");
            onClose(e);
          }}
        >
          Download
        </Menu.Item>
        <Menu.Item
          isDisabled={resume.primary}
          isLocked={isUpdating}
          height="34px"
          icon={
            <Icon
              key="0"
              icon="check"
              size="14px"
              className="text-green-700"
              iconStyle="solid"
              isLoading={isUpdating}
              loadingClassName="text-gray-600"
            />
          }
          onClick={async e => {
            setIsUpdating(true);
            let response: Awaited<ReturnType<typeof prioritizeResume>> | null = null;
            try {
              response = await prioritizeResume(resume.id);
            } catch (e) {
              logger.error(`There was an error prioritizing the resume '${resume.id}':\n${e}`, {
                error: e,
                resume: resume.id,
              });
              setIsUpdating(false);
              return toast.error("There was an error prioritizing the resume.");
            }
            setIsUpdating(false);
            if (isApiClientGlobalErrorJson(response)) {
              logger.error(`There was an error prioritizing the resume '${resume.id}'.`, {
                response,
                resume: resume.id,
              });
              return toast.error("There was an error prioritizing the resume.");
            }
            onClose(e);
            return manager.sync(response.resumes);
          }}
        >
          Set as Primary
        </Menu.Item>
        <Menu.Item
          isLocked={isDeleting}
          height="34px"
          icon={
            <Icon
              icon={{ name: "trash-alt" }}
              size="14px"
              className="text-red-500"
              isLoading={isDeleting}
              loadingClassName="text-gray-600"
            />
          }
          onClick={async e => {
            e.stopPropagation();
            setIsDeleting(true);
            let response: BrandResume[] | null = null;
            try {
              response = await deleteResume(resume.id);
            } catch (e) {
              logger.error(`There was an error deleting the resume '${resume.filename}':\n${e}`, {
                id: resume.id,
                resume,
              });
              return toast.error(`There was an error deleting the resume '${resume.filename}'.`);
            } finally {
              setIsDeleting(false);
            }
            /* We need to sync the manager with the new set of resumes after the delete was
               performed because the delete may have changed the primary resume that is exposed
               for download. */
            onClose(e);
            return manager.sync(response);
          }}
        >
          Delete
        </Menu.Item>
      </Menu.Content>
    </Menu>
  );
};
