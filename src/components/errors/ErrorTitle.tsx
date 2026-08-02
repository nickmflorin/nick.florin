import { type JSX, useMemo } from 'react';

import type * as types from './types';

import { isApiError } from '~/api';
import { HttpNetworkError } from '~/integrations/http';

import { classNames, type ComponentProps } from '~/components/types';
import { type TypographyCharacteristics } from '~/components/types/typography';
import { Text } from '~/components/typography/Text';

export interface ErrorTitleProps
  extends Omit<TypographyCharacteristics, 'lineClamp' | 'truncate'>, ComponentProps {
  readonly children?: string;
  readonly error?: types.ErrorType;
}

export const ErrorTitle = ({
  children,
  className = 'text-text',
  error,
  fontSize = 'lg',
  fontWeight = 'medium',
  ...props
}: ErrorTitleProps): JSX.Element => {
  const title = useMemo(() => {
    if (children) {
      return children;
    } else if (isApiError(error) && !(error instanceof HttpNetworkError)) {
      return `${error.status}`;
    }
    return 'Error';
  }, [children, error]);

  return (
    <Text
      {...props}
      className={classNames('text-center', className)}
      fontSize={fontSize}
      fontWeight={fontWeight}
    >
      {title}
    </Text>
  );
};
