import React from "react";

import clsx from "clsx";

import type * as types from "./types";

import type { ComponentProps } from "~/components/types";

export interface RejectedFilesProps extends ComponentProps {
  readonly files: types.RejectedFile[];
}

export const RejectedFiles = ({ files, ...props }: RejectedFilesProps) => (
  <div {...props} className={clsx("flex flex-col gap-[4px]", props.className)}>
    {files.map((f, index) => (
      <div key={index}>{f.file.name}</div>
    ))}
  </div>
);
