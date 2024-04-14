"use client";
import React from "react";

import { Dropzone, type DropzoneProps } from "@mantine/dropzone";

import { Loading } from "~/components/feedback/Loading";
import { Icon } from "~/components/icons/Icon";
import type { ComponentProps } from "~/components/types";
import { Text } from "~/components/typography/Text";

const DEFAULT_MAX_FILE_UPLOAD_SIZE_MB = 15;
const DEFAULT_MAX_UPLOAD_SIZE = DEFAULT_MAX_FILE_UPLOAD_SIZE_MB * 1048 ** 2;

export interface UploadDropzoneProps
  extends Pick<DropzoneProps, "onDrop" | "onReject" | "accept" | "multiple">,
    ComponentProps {
  readonly maxUploadSize?: number;
  readonly isLoading?: boolean;
}

export const UploadDropzone = ({
  multiple = true,
  isLoading,
  maxUploadSize = DEFAULT_MAX_UPLOAD_SIZE,
  ...props
}: UploadDropzoneProps) => (
  <Dropzone
    {...props}
    className="dropzone"
    multiple={multiple}
    maxSize={maxUploadSize}
    disabled={isLoading}
  >
    <Loading isLoading={isLoading}>
      <div className="flex flex-row gap-[12px] items-center">
        <Icon name="image" size="28px" className="text-gray-600" />
        <Text size="sm" className="text-body">
          Drag files here or click to upload.
        </Text>
      </div>
    </Loading>
  </Dropzone>
);
