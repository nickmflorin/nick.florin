import { Fragment, type JSX } from 'react';

import { Icon } from '~/components/icons/Icon';
import {
  classNames,
  type ComponentProps,
  type TypographyCharacteristics,
} from '~/components/types';
import { type QuantitativeSize, sizeToString } from '~/components/types/sizes';

import { Text } from './Text';

export interface PipedTextProps extends TypographyCharacteristics, ComponentProps {
  readonly children: (JSX.Element | null | string | undefined)[];
  readonly gap?: QuantitativeSize<'px'>;
  readonly pipeClassName?: ComponentProps['className'];
  readonly pipeSize?: QuantitativeSize<'px'>;
  readonly textClassName?: ComponentProps['className'];
}

export const PipedText = ({
  children,
  className,
  fontSize = 'xs',
  gap = '4px',
  pipeClassName,
  pipeSize = '14px',
  style,
  textClassName,
  ...props
}: PipedTextProps): JSX.Element | null => {
  const filtered = children.filter(
    (child): child is JSX.Element | string => child !== null && child !== undefined,
  );
  if (filtered.length === 0) {
    return null;
  }
  return (
    <div
      className={classNames('flex flex-row items-center', className)}
      style={{ ...style, gap: sizeToString(gap, 'px') }}
    >
      {filtered.map((child, index) => {
        if (index !== filtered.length - 1) {
          return (
            <Fragment key={index}>
              <Text
                {...props}
                className={classNames('text-description', textClassName)}
                fontSize={fontSize}
              >
                {child}
              </Text>
              <Icon
                className={classNames('text-gray-800', pipeClassName)}
                icon='pipe'
                size={pipeSize}
              />
            </Fragment>
          );
        }
        return (
          <Text
            {...props}
            className={classNames('text-description', textClassName)}
            fontSize={fontSize}
            key={index}
          >
            {child}
          </Text>
        );
      })}
    </div>
  );
};
