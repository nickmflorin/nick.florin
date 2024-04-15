import dynamic from "next/dynamic";

import clsx from "clsx";
import { type FileWithPath } from "react-dropzone-esm";

import type * as types from "./types";

import { type ComponentProps } from "~/components/types";

import { UploadDropzonePlaceholder } from "./dropzone/UploadDropzonePlaceholder";

const UploadDropzone = dynamic(() => import("./dropzone/UploadDropzone"), {
  loading: () => <UploadDropzonePlaceholder />,
});

export interface ManagedUploadsContainerProps<M extends types.BaseUploadModel>
  extends Omit<types.UploadDropzoneProps, "onDrop" | "onReject"> {
  readonly dropzoneClassName?: ComponentProps["className"];
  readonly children: JSX.Element;
  readonly manager: Omit<types.UploadsManager<M>, "sync" | "uploads">;
}

export const ManagedUploadsContainer = <M extends types.BaseUploadModel>({
  dropzoneClassName,
  manager,
  className,
  style,
  children,
  ...props
}: ManagedUploadsContainerProps<M>) => (
  <div
    style={style}
    className={clsx("flex flex-col gap-[12px] h-full max-h-full overflow-y-hidden", className)}
  >
    <div
      className="relative flex flex-col overflow-y-auto grow"
      style={{ maxHeight: "calc(100% - 60px)" }}
    >
      {children}
    </div>
    <UploadDropzone
      {...props}
      isDisabled={manager.isUploading || props.isDisabled}
      className={dropzoneClassName}
      isLoading={manager.isUploading}
      onDrop={(files: FileWithPath[]) => manager.performUpload(files)}
      onReject={files => manager.addRejectedFiles(files)}
    />
  </div>
);
