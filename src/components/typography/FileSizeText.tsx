import { type JSX } from 'react';

import { type TypographyComponent } from '~/components/types';

import {
  FileSize,
  type FileSizeFileProps,
  type FileSizeProps,
  type FileSizeSizeProps,
} from './FileSize';
import { Text, type TextProps } from './Text';

type FileSizeTextSizeProps<C extends TypographyComponent<'text'>> = FileSizeSizeProps &
  Omit<TextProps<C>, 'children'>;

type FileSizeTextFileProps<C extends TypographyComponent<'text'>> = FileSizeFileProps &
  Omit<TextProps<C>, 'children'>;

export type FileSizeTextProps<C extends TypographyComponent<'text'>> =
  FileSizeTextFileProps<C> | FileSizeTextSizeProps<C>;

export const FileSizeText = <C extends TypographyComponent<'text'>>({
  file,
  fileSize,
  fontSize = 'sm',
  ...props
}: FileSizeTextProps<C>): JSX.Element => (
  <Text {...props} fontSize={fontSize}>
    <FileSize {...({ file, fileSize } as FileSizeProps)} />
  </Text>
);
