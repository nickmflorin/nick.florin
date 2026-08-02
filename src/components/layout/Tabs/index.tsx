import { type JSX } from 'react';

import { type LabeledNavItem } from '~/application/pages';

import { classNames, type ComponentProps } from '~/components/types';

import { Tab } from './Tab';

export interface TabsProps extends ComponentProps {
  readonly children?: JSX.Element | JSX.Element[];
  readonly items: LabeledNavItem[];
}

export const Tabs = ({ children, items, ...props }: TabsProps) => (
  <div
    {...props}
    className={classNames(
      /* The bottom padding of 2px is to make sure that the border on the bottom is not cutoff by
         overflow.  On the other hand, the bottom padding of 8px is for the scrollbar, in the case
         that the tabs overflow the container in mobile views. */
      'flex flex-row items-center w-full min-w-full max-w-full pb-[2px]',
      'max-sm:pb-0',
      props.className,
    )}
  >
    <div
      className={classNames(
        'flex flex-row items-center justify-between border-b-[2px] border-gray-200 w-full',
        'max-sm:flex-col max-sm:justify-center max-sm:border-none max-sm:w-full',
      )}
    >
      <div
        className={classNames(
          'flex flex-row items-center max-sm:flex-col max-sm:justify-center max-sm:w-full',
          'max-[700px]:w-full max-[700px]:justify-between',
        )}
      >
        {items.map((item, index) => (
          <Tab item={item} key={index} />
        ))}
      </div>
      {children}
    </div>
  </div>
);
