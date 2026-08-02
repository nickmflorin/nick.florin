import { type ReactNode } from 'react';

import { classNames, type ComponentProps } from '~/components/types';
import { Description, Label } from '~/components/typography';

export interface TourContentProps extends ComponentProps {
  readonly children: ReactNode;
  readonly label?: ReactNode;
}

export const TourContent = ({ children, label, ...props }: TourContentProps) => (
  <div {...props} className={classNames('tour__content', props.className)}>
    {typeof label === 'string' ? <Label fontSize='sm'>{label}</Label> : label}
    {typeof children === 'string' ? <Description fontSize='xs'>{children}</Description> : children}
  </div>
);
