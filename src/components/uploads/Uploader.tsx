"use client";
import { forwardRef, useImperativeHandle, useState, useMemo } from "react";

import clsx from "clsx";
import { v4 as uuid } from "uuid";

import type { FileWithPath } from "react-dropzone-esm";

import type { ComponentProps } from "~/components/types";

import { RejectedFiles } from "./RejectedFiles";
import * as types from "./types";
import { UploadDropzone, type UploadDropzoneProps } from "./UploadDropzone";

export type UploaderInstance = {
  readonly setIsLoading: (v: boolean) => void;
};

export interface UploaderProps extends Omit<UploadDropzoneProps, "onReject" | "onDrop"> {
  readonly dropzoneClassName?: ComponentProps["className"];
  readonly onUpload: (files: FileWithPath[], instance: UploaderInstance) => void;
}

export const Uploader = forwardRef<UploaderInstance, UploaderProps>(
  ({ onUpload, className, style, dropzoneClassName, ...props }, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [rejectedFiles, setRejectedFiles] = useState<types.RejectedFile[]>([]);

    const uploaderInstance = useMemo(() => ({ setIsLoading }), []);

    useImperativeHandle(ref, () => uploaderInstance);

    return (
      <div style={style} className={clsx("flex flex-col gap-[12px] overflow-y-hidden", className)}>
        <UploadDropzone
          {...props}
          className={dropzoneClassName}
          isLoading={isLoading}
          onDrop={(files: FileWithPath[]) => onUpload(files, uploaderInstance)}
          onReject={files =>
            setRejectedFiles(curr => [
              ...curr,
              ...files.map(f => {
                const id = uuid();
                return {
                  file: f.file,
                  id,
                  errors: types.getRejectedFileErrors(f),
                  onClose: () => setRejectedFiles(curr => curr.filter(r => r.id !== id)),
                };
              }),
            ])
          }
        />
        <RejectedFiles files={rejectedFiles} className="grow overflow-y-auto" />
      </div>
    );
  },
);
