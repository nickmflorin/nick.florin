import type { BrandResume } from "~/database/model";

import { Icon } from "~/components/icons/Icon";
import * as types from "~/components/uploads/types";
import { UploadTile, type UploadTileProps } from "~/components/uploads/UploadTile";

import { UploadResumeDropdownMenu } from "../UploadResumeDropdownMenu";

export interface UploadResumeTileProps extends Omit<UploadTileProps<BrandResume>, "actions"> {}

export const UploadResumeTile = ({ upload, ...props }: UploadResumeTileProps) => (
  <UploadTile
    {...props}
    upload={upload}
    actions={[
      types.isUploadOfState(upload, ["uploaded", "existing"]) && upload.model.primary === true ? (
        <Icon key="0" icon="check" size="14px" className="text-green-700" iconStyle="solid" />
      ) : null,
      types.isUploadOfState(upload, ["uploaded", "existing"]) ? (
        <UploadResumeDropdownMenu key="2" resume={upload.model} manager={props.manager} />
      ) : null,
    ]}
  />
);
