import type { FileError } from "react-dropzone-esm";

import { Link, IconButton } from "~/components/buttons";
import { Icon } from "~/components/icons/Icon";
import { Spinner } from "~/components/icons/Spinner";
import { type Action } from "~/components/structural/Actions";
import { Actions } from "~/components/structural/Actions";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { Label, Text, Description } from "~/components/typography";
import { DateTimeText } from "~/components/typography/DateTimeText";
import { FileSize } from "~/components/typography/FileSize";
import { PipedText } from "~/components/typography/PipedText";

import * as types from "./types";

const UploadTileError = ({ error }: { error: string | string[] | FileError | FileError[] }) =>
  Array.isArray(error) ? (
    <div className="flex flex-col gap-[4px]">
      {error.map((e, index) => (
        <UploadTileError key={index} error={e} />
      ))}
    </div>
  ) : (
    <div className="flex flex-row items-center gap-[4px]">
      <Icon icon="circle-exclamation" size="14px" className="text-red-400" />
      <Description fontSize="xs">{typeof error === "string" ? error : error.message}</Description>
    </div>
  );

export type UploadTileRendererProps<M extends types.BaseUploadModel> = {
  readonly upload: types.Upload<M>;
  readonly manager: types.UploadsManager<M>;
};

export interface UploadTileProps<M extends types.BaseUploadModel>
  extends ComponentProps,
    UploadTileRendererProps<M> {
  readonly actions?: Action[];
}

export const UploadTile = <M extends types.BaseUploadModel>({
  upload,
  actions,
  manager,
  ...props
}: UploadTileProps<M>): JSX.Element => (
  <div
    {...props}
    className={classNames(
      "relative p-[8px] border rounded-md",
      { "opacity-50": upload.state === "uploading" },
      props.className,
    )}
  >
    <div className="flex flex-col gap-[4px]">
      <div className="flex flex-row w-full justify-between items-center">
        <div className="flex flex-row gap-[8px] items-center">
          <Icon icon="file-pdf" size="14px" className="text-gray-600" />
          {types.isUploadOfState(upload, ["existing", "uploaded"]) ? (
            <Link
              element="a"
              className="leading-[18px]"
              fontSize="xs"
              openInNewTab
              href={upload.model.url}
            >
              {upload.model.filename}
            </Link>
          ) : (
            <Label fontSize="xs" fontWeight="medium" className="leading-[18px]">
              {upload.file.name}
            </Label>
          )}
        </div>
        <Actions
          actions={[
            ...(actions ?? []),
            types.isUploadOfState(upload, ["failed"]) ? (
              <IconButton.Transparent
                size="xsmall"
                icon={{ name: "xmark" }}
                className={classNames(
                  "text-gray-500 hover:text-gray-600",
                  "h-[20px] w-[20px] min-h-[20px]",
                )}
                onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  manager.dismissFailedUpload(upload.uploadId);
                }}
              />
            ) : null,
            types.isUploadOfState(upload, ["rejected"]) ? (
              <IconButton.Transparent
                size="xsmall"
                icon={{ name: "xmark" }}
                className={classNames(
                  "text-gray-500 hover:text-gray-600",
                  "h-[20px] w-[20px] min-h-[20px]",
                )}
                onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  manager.dismissRejectedUpload(upload.uploadId);
                }}
              />
            ) : null,
          ]}
        />
      </div>
      <div className="flex flex-col gap-[6px] pl-[22px]">
        <PipedText>
          <FileSize
            fileSize={
              types.isUploadOfState(upload, ["existing", "uploaded"])
                ? upload.model.size
                : upload.file.size
            }
          />
          {types.isUploadOfState(upload, ["uploading"]) ? (
            <div className="flex flex-row gap-[4px] items-center">
              <Spinner className="text-gray-500" />
              <Description fontSize="xs">Uploading...</Description>
            </div>
          ) : types.isUploadOfState(upload, ["existing", "uploaded"]) ? (
            <Text fontSize="sm">
              Uploaded&nbsp;
              <DateTimeText inherit value={upload.model.createdAt} />
            </Text>
          ) : null}
        </PipedText>
        {types.isUploadOfState(upload, ["failed", "rejected"]) && (
          <UploadTileError error={upload.errors} />
        )}
      </div>
    </div>
  </div>
);
