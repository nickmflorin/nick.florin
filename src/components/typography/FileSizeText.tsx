import {
  FileSize,
  type FileSizeSizeProps,
  type FileSizeFileProps,
  type FileSizeProps,
} from "./FileSize";
import { Text, type TextProps, type TextComponent } from "./Text";

type FileSizeTextSizeProps<C extends TextComponent> = Omit<TextProps<C>, "children"> &
  FileSizeSizeProps;

type FileSizeTextFileProps<C extends TextComponent> = Omit<TextProps<C>, "children"> &
  FileSizeFileProps;

export type FileSizeTextProps<C extends TextComponent> =
  | FileSizeTextSizeProps<C>
  | FileSizeTextFileProps<C>;

export const FileSizeText = <C extends TextComponent>({
  file,
  fileSize,
  fontSize = "sm",
  ...props
}: FileSizeTextProps<C>): JSX.Element => (
  <Text {...props} fontSize={fontSize}>
    <FileSize {...({ file, fileSize } as FileSizeProps)} />
  </Text>
);
