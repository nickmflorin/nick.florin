import React from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import * as types from "./types";
import { UploadTile, type UploadTileProps, type UploadTileRendererProps } from "./UploadTile";

export interface UploadsProps<M extends types.BaseUploadModel>
  extends ComponentProps,
    Omit<UploadTileProps<M>, "upload" | "onDismiss" | "actions"> {
  readonly manager: types.UploadsManager<M>;
  readonly children?: (props: UploadTileRendererProps<M>) => JSX.Element;
}

export const Uploads = <M extends types.BaseUploadModel>({
  manager,
  children,
  ...props
}: UploadsProps<M>) => (
  <div {...props} className={clsx("relative w-full flex flex-col gap-[4px]", props.className)}>
    {manager.uploads.map(upload => {
      const key = types.isUploadOfState(upload, ["existing", "uploaded"])
        ? upload.model.id
        : upload.uploadId;
      return typeof children === "function" ? (
        <React.Fragment key={key}>{children({ manager, upload })}</React.Fragment>
      ) : (
        <UploadTile upload={upload} key={key} manager={manager} />
      );
    })}
  </div>
);
