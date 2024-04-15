import { FileSize, type FileSizeProps } from "~/components/typography/FileSize";

import { Tag, type TagProps } from "./Tag";

type FileSizeTagSizeProps = Omit<TagProps, "children" | "icon"> & {
  readonly fileSize: number | bigint;
  readonly file?: never;
};

type FileSizeTagFileProps = Omit<TagProps, "children" | "icon"> & {
  readonly file: File;
  readonly fileSize?: never;
};

export type FileSizeTagProps = FileSizeTagSizeProps | FileSizeTagFileProps;

export const FileSizeTag = ({ file, fileSize, ...props }: FileSizeTagProps): JSX.Element => (
  <Tag {...props} icon={{ name: "server" }}>
    <FileSize {...({ file, fileSize } as FileSizeProps)} />
  </Tag>
);
