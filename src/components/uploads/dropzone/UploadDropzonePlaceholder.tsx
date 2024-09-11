"use client";
import React from "react";

import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";

import { UploadDropzoneContent } from "./UploadDropzoneContent";

export interface UploadDropzonePlaceholderProps extends ComponentProps {}

export const UploadDropzonePlaceholder = (props: UploadDropzonePlaceholderProps) => (
  <div
    {...props}
    className={classNames(
      "relative w-full min-h-[60px] h-[60px] border border-dashed rounded-md opacity-50",
      "flex flex-col justify-center items-center",
      "pointer-events-none",
      props.className,
    )}
  >
    <UploadDropzoneContent />
  </div>
);
