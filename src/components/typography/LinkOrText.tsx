'use client';
import { type JSX } from 'react';

import { Link } from '~/components/buttons';
import { Tooltip, type TooltipProps } from '~/components/floating/Tooltip';
import {
  classNames,
  type ComponentProps,
  type FontFamily,
  type FontSize,
  type FontWeight,
} from '~/components/types';

import { Text } from './Text';

export interface LinkOrTextProps extends ComponentProps {
  readonly children: string;
  readonly fontFamily?: FontFamily;
  readonly fontSize?: FontSize;
  readonly fontWeight?: FontWeight;
  readonly linkClassName?: ComponentProps['className'];
  readonly textClassName?: ComponentProps['className'];
  readonly tooltip?: string;
  readonly tooltipPlacement?: TooltipProps['placement'];
  readonly url?: null | string;
}

export const LinkOrText = ({
  children,
  fontFamily = 'inter',
  fontSize = 'md',
  fontWeight = 'medium',
  linkClassName,
  textClassName,
  tooltip,
  tooltipPlacement = 'bottom-end',
  url,
  ...props
}: LinkOrTextProps): JSX.Element => {
  if (url) {
    if (tooltip) {
      return (
        <Tooltip content={tooltip} placement={tooltipPlacement}>
          {({ params, ref }) => (
            <Link
              {...params}
              {...props}
              className={classNames(props.className, linkClassName)}
              element='a'
              fontFamily={fontFamily}
              fontSize={fontSize}
              fontWeight={fontWeight}
              href={url}
              openInNewTab
              ref={ref}
            >
              {children}
            </Link>
          )}
        </Tooltip>
      );
    }
    return (
      <Link
        {...props}
        className={classNames(props.className, linkClassName)}
        element='a'
        fontFamily={fontFamily}
        fontSize={fontSize}
        fontWeight={fontWeight}
        href={url}
        openInNewTab
      >
        {children}
      </Link>
    );
  }
  return (
    <Text
      {...props}
      className={classNames(props.className, textClassName)}
      fontFamily={fontFamily}
      fontSize={fontSize}
      fontWeight={fontWeight}
    >
      {children}
    </Text>
  );
};
