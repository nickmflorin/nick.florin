import React from "react";

import { Icon } from "~/components/icons/Icon";
import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";
import { Text } from "~/components/typography";

export interface UploadDropzoneContentProps extends ComponentProps {}

export const UploadDropzoneContent = (props: UploadDropzoneContentProps) => (
  <div {...props} className={classNames("flex flex-row gap-[12px] items-center", props.className)}>
    <Icon icon="image" size="28px" className="text-gray-600" />
    <Text fontSize="sm" className="text-body">
      Drag files here or click to upload.
    </Text>
  </div>
);
