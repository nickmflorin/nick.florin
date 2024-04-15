import { toFileSizeString } from "~/lib/fs";

export type FileSizeSizeProps = {
  readonly fileSize: number | bigint;
  readonly file?: never;
};

export type FileSizeFileProps = {
  readonly file: File;
  readonly fileSize?: never;
};

export type FileSizeProps = FileSizeSizeProps | FileSizeFileProps;

export const FileSize = ({ file, fileSize }: FileSizeProps): string =>
  fileSize !== undefined
    ? toFileSizeString(fileSize)
    : file !== undefined
      ? toFileSizeString(file.size)
      : "";
