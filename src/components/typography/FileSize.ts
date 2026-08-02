import { toFileSizeString } from '~/lib/fs';

export type FileSizeSizeProps = {
  readonly file?: never;
  readonly fileSize: bigint | number;
};

export type FileSizeFileProps = {
  readonly file: File;
  readonly fileSize?: never;
};

export type FileSizeProps = FileSizeFileProps | FileSizeSizeProps;

export const FileSize = ({ file, fileSize }: FileSizeProps): string =>
  fileSize === undefined ? toFileSizeString(file.size) : toFileSizeString(fileSize);
