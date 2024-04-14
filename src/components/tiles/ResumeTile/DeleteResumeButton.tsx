"use client";
import { useState } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import type { BrandResume } from "~/prisma/model";
import { deleteResume } from "~/actions/mutations/resumes";
import { IconButton } from "~/components/buttons";

export interface DeleteResumeButtonProps {
  readonly resume: BrandResume;
}

export const DeleteResumeButton = ({ resume }: DeleteResumeButtonProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  return (
    <IconButton.Transparent
      size="xsmall"
      icon={{ name: "trash-alt" }}
      className="text-red-500 rounded-full hover:text-red-600 disabled:text-red-300"
      loadingClassName="text-gray-400"
      isLoading={isDeleting}
      onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setIsDeleting(true);
        try {
          await deleteResume(resume.id);
        } catch (e) {
          logger.error(`There was an error deleting the resume:\n${e}`, {
            id: resume.id,
          });
          toast.error("There was an error deleting the resume.");
        } finally {
          setIsDeleting(false);
        }
      }}
    />
  );
};
