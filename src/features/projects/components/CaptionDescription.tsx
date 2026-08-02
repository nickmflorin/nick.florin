import { type JSX } from 'react';

import { classNames } from '~/components/types';
import { Description, type DescriptionProps } from '~/components/typography/Description';

export interface CaptionDescriptionProps extends Omit<
  DescriptionProps<'div'>,
  'component' | 'fontSize'
> {
  readonly isCentered?: boolean;
}

export const CaptionDescription = ({
  children,
  isCentered = false,
  ...props
}: CaptionDescriptionProps): JSX.Element => (
  <Description
    {...props}
    className={classNames(
      'text-sm max-md:text-xs text-left text-[#a4a4a4]',
      { 'text-center': isCentered, 'w-full': !isCentered },
      props.className,
    )}
    component='div'
  >
    {children}
  </Description>
);
