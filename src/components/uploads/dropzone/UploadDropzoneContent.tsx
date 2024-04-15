import React from "react";

import clsx from "clsx";

import { Icon } from "~/components/icons/Icon";
import type { ComponentProps } from "~/components/types";
import { Text } from "~/components/typography/Text";

export interface UploadDropzoneContentProps extends ComponentProps {}

export const UploadDropzoneContent = (props: UploadDropzoneContentProps) => (
  <div {...props} className={clsx("flex flex-row gap-[12px] items-center", props.className)}>
    <Icon name="image" size="28px" className="text-gray-600" />
    <Text size="sm" className="text-body">
      Drag files here or click to upload.
    </Text>
  </div>
);
