import { type JSX } from 'react';

import type * as types from './types';

import {
  classNames,
  type ComponentProps,
  type QuantitativeSize,
  sizeToString,
  type TypographyCharacteristics,
} from '~/components/types';

import { ErrorContent } from './ErrorContent';
import { ErrorTitle } from './ErrorTitle';

export interface ErrorDetailProps extends ComponentProps {
  readonly children?: types.ErrorContentType;
  readonly error?: types.ErrorType;
  readonly gap?: QuantitativeSize<'px'>;
  readonly title?: string;
  readonly titleClassName?: ComponentProps['className'];
  readonly titleFontFamily?: TypographyCharacteristics['fontFamily'];
  readonly titleFontSize?: TypographyCharacteristics['fontSize'];
  readonly titleFontWeight?: TypographyCharacteristics['fontWeight'];
}

export const ErrorDetail = ({
  children,
  className,
  error,
  gap = 12,
  style,
  title = 'Error',
  titleClassName = 'text-text',
  titleFontFamily,
  titleFontSize = 'lg',
  titleFontWeight = 'medium',
}: ErrorDetailProps): JSX.Element => (
  <div
    className={classNames('flex flex-col justify-center max-w-[90%]', className)}
    style={{ ...style, gap: sizeToString(gap, 'px') }}
  >
    <ErrorTitle
      className={titleClassName}
      error={error}
      fontFamily={titleFontFamily}
      fontSize={titleFontSize}
      fontWeight={titleFontWeight}
    >
      {title}
    </ErrorTitle>
    <ErrorContent error={error}>{children}</ErrorContent>
  </div>
);
