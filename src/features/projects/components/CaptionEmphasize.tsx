import { type JSX, type ReactNode } from 'react';

export const CaptionEmphasize = ({ children }: { readonly children: ReactNode }): JSX.Element => (
  <span className='font-medium text-[#7f7f7f]'>{children}</span>
);
