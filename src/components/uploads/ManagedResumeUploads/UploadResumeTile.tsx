import { useState } from "react";

import clsx from "clsx";
import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import type { ApiResume } from "~/prisma/model";
import { deleteResume } from "~/actions/mutations/resumes";
import { IconButton } from "~/components/buttons";
import { Icon } from "~/components/icons/Icon";

import * as types from "../types";
import { UploadTile, type UploadTileProps } from "../UploadTile";

import { UploadResumeTileEllipsisMenu } from "./UploadResumeTileEllipsisMenu";

export interface UploadResumeTileProps
  extends Omit<UploadTileProps<ApiResume<["primary"]>>, "actions"> {}

export const UploadResumeTile = ({ upload, ...props }: UploadResumeTileProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <UploadTile
      {...props}
      upload={upload}
      actions={[
        types.isUploadOfState(upload, ["uploaded", "existing"]) && upload.model.primary === true ? (
          <Icon key="0" name="check" size="14px" className="text-green-700" iconStyle="solid" />
        ) : null,
        types.isUploadOfState(upload, ["uploaded", "existing"]) ? (
          <IconButton.Bare
            size="xsmall"
            key="1"
            icon={{ name: "trash-alt" }}
            className={clsx(
              "text-red-500 hover:text-red-600 disabled:text-red-300",
              "h-[18px] w-[18px] min-h-[18px]",
            )}
            loadingClassName="text-gray-400"
            isLoading={isDeleting}
            onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              setIsDeleting(true);
              let response: ApiResume<["primary"]>[] | null = null;
              try {
                response = await deleteResume(upload.model.id);
              } catch (e) {
                logger.error(`There was an error deleting the resume:\n${e}`, {
                  id: upload.model.id,
                  resume: upload.model,
                });
                toast.error("There was an error deleting the resume.");
              } finally {
                setIsDeleting(false);
              }
              if (response) {
                /* We need to sync the manager with the new set of resumes after the delete was
                   performed because the delete may have changed the primary resume that is exposed
                   for download. */
                props.manager.sync(response);
              }
            }}
          />
        ) : null,
        types.isUploadOfState(upload, ["uploaded", "existing"]) ? (
          <UploadResumeTileEllipsisMenu key="2" />
        ) : null,
      ]}
    />
  );
};
