import { type TypographyComponent } from "~/components/types";

import {
  FileSize,
  type FileSizeSizeProps,
  type FileSizeFileProps,
  type FileSizeProps,
} from "./FileSize";
import { Text, type TextProps } from "./Text";

type FileSizeTextSizeProps<C extends TypographyComponent<"text">> = Omit<TextProps<C>, "children"> &
  FileSizeSizeProps;

type FileSizeTextFileProps<C extends TypographyComponent<"text">> = Omit<TextProps<C>, "children"> &
  FileSizeFileProps;

export type FileSizeTextProps<C extends TypographyComponent<"text">> =
  | FileSizeTextSizeProps<C>
  | FileSizeTextFileProps<C>;

export const FileSizeText = <C extends TypographyComponent<"text">>({
  file,
  fileSize,
  fontSize = "sm",
  ...props
}: FileSizeTextProps<C>): JSX.Element => (
  <Text {...props} fontSize={fontSize}>
    <FileSize {...({ file, fileSize } as FileSizeProps)} />
  </Text>
);
