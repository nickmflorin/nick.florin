import { type JSX } from 'react';

import { isApiError } from '~/api';

import {
  classNames,
  type ComponentProps,
  type TypographyCharacteristics,
} from '~/components/types';
import { Text } from '~/components/typography/Text';

import * as types from './types';

export interface ErrorContentProps extends Omit<
  TypographyCharacteristics,
  'lineClamp' | 'transform' | 'truncate'
> {
  readonly children?: types.ErrorContentType;
  readonly error?: types.ErrorType;
  readonly textClassName?: ComponentProps['className'];
}

export const ErrorContent = ({
  children,
  error,
  fontFamily,
  fontSize = 'sm',
  fontWeight = 'regular',
  textClassName = 'text-gray-500',
}: ErrorContentProps): JSX.Element => {
  const message =
    children === undefined
      ? error && isApiError(error)
        ? error.message
        : (error ?? types.DEFAULT_ERROR_MESSAGE)
      : children;

  if (Array.isArray(message)) {
    for (const m of message) {
      if (m instanceof Error) {
        throw new Error(JSON.stringify(message));
      }
    }
    return (
      <div className='flex flex-col gap-[10px]'>
        {message.map((child, index) => (
          <ErrorContent
            fontFamily={fontFamily}
            fontSize={fontSize}
            fontWeight={fontWeight}
            key={index}
            textClassName={textClassName}
          >
            {child}
          </ErrorContent>
        ))}
      </div>
    );
  } else if (typeof message === 'string') {
    return (
      <Text
        className={classNames('text-center', textClassName)}
        fontFamily={fontFamily}
        fontSize={fontSize}
        fontWeight={fontWeight}
      >
        {message}
      </Text>
    );
  }
  return <>{message}</>;
};
