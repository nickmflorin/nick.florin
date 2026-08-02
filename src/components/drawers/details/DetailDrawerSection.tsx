import { type JSX } from 'react';

import { Label } from '~/components/typography';

interface DetailDrawerSectionProps {
  readonly children: JSX.Element | JSX.Element[];
  readonly label: string;
}

export const DetailDrawerSection = ({ children, label }: DetailDrawerSectionProps) =>
  Array.isArray(children) && children.length === 0 ? null : (
    <div className='flex flex-col gap-[8px] pr-[12px]'>
      <hr className='w-full border-t border-gray-200' />
      <div className='flex flex-col gap-[12px]'>
        <Label fontSize='sm' fontWeight='medium'>
          {label}
        </Label>
        {Array.isArray(children) ? (
          <div className='flex flex-col gap-[12px]'>{children}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
