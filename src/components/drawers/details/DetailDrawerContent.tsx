import { type JSX } from 'react';

import { classNames, type ComponentProps } from '~/components/types';
import { Description, Title } from '~/components/typography';

import { ContextDrawer } from '../ContextDrawer';

export interface DetailDrawerContentProps extends ComponentProps {
  readonly badge?: JSX.Element;
  readonly children: JSX.Element[];
  readonly description: null | string;
  readonly title: string;
}

export const DetailDrawerContent = ({
  badge,
  children,
  description,
  title,
  ...props
}: DetailDrawerContentProps) => (
  <ContextDrawer.Content
    {...props}
    className={classNames('gap-[14px] overflow-y-hidden', props.className)}
  >
    <div className='flex flex-col gap-[8px]'>
      <div className='flex flex-col gap-[6px]'>
        <Title className='text-gray-700 max-w-fit' component='h2'>
          {title}
        </Title>
        {badge}
      </div>
      <Description>{description}</Description>
    </div>
    <div className='flex flex-col gap-[14px] overflow-y-auto'>{children}</div>
  </ContextDrawer.Content>
);
