import type { BrandResume } from "~/prisma/model";

import { Icon } from "~/components/icons/Icon";

import * as types from "../types";
import { UploadTile, type UploadTileProps } from "../UploadTile";

import { UploadResumeTileEllipsisMenu } from "./UploadResumeTileEllipsisMenu";

export interface UploadResumeTileProps extends Omit<UploadTileProps<BrandResume>, "actions"> {}

export const UploadResumeTile = ({ upload, ...props }: UploadResumeTileProps) => (
  <UploadTile
    {...props}
    upload={upload}
    actions={[
      types.isUploadOfState(upload, ["uploaded", "existing"]) && upload.model.primary === true ? (
        <Icon key="0" name="check" size="14px" className="text-green-700" iconStyle="solid" />
      ) : null,
      types.isUploadOfState(upload, ["uploaded", "existing"]) ? (
        <UploadResumeTileEllipsisMenu key="2" resume={upload.model} manager={props.manager} />
      ) : null,
    ]}
  />
);
