'use client';

import { Timeline as RootTimeline } from '@mantine/core';

import { classNames } from '~/components/types';

import { type TimelineProps } from './types';

export const Timeline = ({ children, className, style, ...props }: TimelineProps) => (
  <div className={classNames('timeline', className)} style={style}>
    <div className='timeline__inner'>
      <RootTimeline
        bulletSize={24}
        lineWidth={2}
        {...props}
        classNames={{
          item: 'timeline__item',
          itemBody: 'timeline__item__body',
          itemBullet: 'timeline__item__bullet',
          itemContent: 'timeline__item__body__content',
        }}
      >
        {children}
      </RootTimeline>
    </div>
  </div>
);
