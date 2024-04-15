import {
  FileSize,
  type FileSizeSizeProps,
  type FileSizeFileProps,
  type FileSizeProps,
} from "./FileSize";
import { Text, type TextProps } from "./Text";

type FileSizeTextSizeProps = Omit<TextProps, "children"> & FileSizeSizeProps;

type FileSizeTextFileProps = Omit<TextProps, "children"> & FileSizeFileProps;

export type FileSizeTextProps = FileSizeTextSizeProps | FileSizeTextFileProps;

export const FileSizeText = ({
  file,
  fileSize,
  size = "sm",
  ...props
}: FileSizeTextProps): JSX.Element => (
  <Text {...props} size={size}>
    <FileSize {...({ file, fileSize } as FileSizeProps)} />
  </Text>
);
