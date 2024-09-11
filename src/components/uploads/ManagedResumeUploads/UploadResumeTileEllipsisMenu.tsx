import { useState } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import type { BrandResume } from "~/prisma/model";

import { deleteResume, prioritizeResume } from "~/actions/mutations/resumes";
import { isApiClientGlobalErrorJson } from "~/api";

import { IconButton } from "~/components/buttons";
import { Icon } from "~/components/icons/Icon";
import { DropdownMenu } from "~/components/menus/generic/DropdownMenu";
import { classNames } from "~/components/types";
import type { UploadsManager } from "~/components/uploads";

export interface UploadResumeTileEllipsisMenuProps {
  readonly manager: UploadsManager<BrandResume>;
  readonly resume: BrandResume;
}

export const UploadResumeTileEllipsisMenu = ({
  manager,
  resume,
}: UploadResumeTileEllipsisMenuProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <DropdownMenu
      placement="bottom-end"
      itemHeight="34px"
      width={160}
      options={{}}
      className="border"
      data={[
        {
          label: "Download",
          icon: { name: "download" },
          href: resume.downloadUrl,
        },
        {
          label: "Set as Primary",
          isDisabled: resume.primary,
          isLocked: isUpdating,
          onClick: async () => {
            setIsUpdating(true);
            let response: Awaited<ReturnType<typeof prioritizeResume>> | null = null;
            try {
              response = await prioritizeResume(resume.id);
            } catch (e) {
              logger.error(`There was an error prioritizing the resume '${resume.id}':\n${e}`, {
                error: e,
                resume: resume.id,
              });
              toast.error("There was an error prioritizing the resume.");
            }
            if (isApiClientGlobalErrorJson(response)) {
              logger.error(`There was an error prioritizing the resume '${resume.id}'.`, {
                response,
                resume: resume.id,
              });
              toast.error("There was an error prioritizing the resume.");
            } else if (response) {
              manager.sync(response.resumes);
            }
          },
          icon: (
            <Icon
              key="0"
              name="check"
              size="14px"
              className="text-green-700"
              iconStyle="solid"
              isLoading={isUpdating}
              loadingClassName="text-gray-600"
            />
          ),
        },
        {
          label: "Delete",
          isLocked: isDeleting,
          icon: (
            <Icon
              icon={{ name: "trash-alt" }}
              size="14px"
              className="text-red-500"
              isLoading={isDeleting}
              loadingClassName="text-gray-600"
            />
          ),
          onClick: async e => {
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
              toast.error(`There was an error deleting the resume '${resume.filename}'.`);
            } finally {
              setIsDeleting(false);
            }
            if (response) {
              /* We need to sync the manager with the new set of resumes after the delete was
                 performed because the delete may have changed the primary resume that is exposed
                 for download. */
              manager.sync(response);
            }
          },
        },
      ]}
    >
      <IconButton.Bare
        size="xsmall"
        icon={{ name: "ellipsis-h" }}
        className={classNames(
          "text-gray-500 hover:text-gray-600 disabled:text-gray-300",
          "h-[18px] w-[18px] min-h-[18px]",
        )}
      />
    </DropdownMenu>
  );
};
