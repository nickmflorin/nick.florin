"use client";
import React from "react";

import { Dropzone } from "@mantine/dropzone";

import type * as types from "../types";

import { Loading } from "~/components/loading/Loading";
import { classNames } from "~/components/types";

import { UploadDropzoneContent } from "./UploadDropzoneContent";

const DEFAULT_MAX_FILE_UPLOAD_SIZE_MB = 15;
const DEFAULT_MAX_UPLOAD_SIZE = DEFAULT_MAX_FILE_UPLOAD_SIZE_MB * 1048 ** 2;

export const UploadDropzone = ({
  multiple = true,
  isLoading = false,
  isDisabled = false,
  maxUploadSize = DEFAULT_MAX_UPLOAD_SIZE,
  ...props
}: types.UploadDropzoneProps) => (
  <Dropzone
    {...props}
    className={classNames(
      "relative w-full min-h-[60px] h-[60px] border border-dashed rounded-md",
      "flex flex-col justify-center items-center hover:border-blue-600",
      { "pointer-events-none": isDisabled },
      props.className,
    )}
    multiple={multiple}
    maxSize={maxUploadSize}
    disabled={isLoading}
    onDrop={(...args) => {
      if (!isDisabled) {
        props.onDrop?.(...args);
      }
    }}
  >
    <Loading isLoading={isLoading}>
      <UploadDropzoneContent />
    </Loading>
  </Dropzone>
);

export default UploadDropzone;
