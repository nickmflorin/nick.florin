import { classNames } from '~/components/types';
import { Text } from '~/components/typography/Text';

import { PopoverContent, type PopoverContentProps } from './PopoverContent';

export type TooltipContentProps = PopoverContentProps;

export const TooltipContent = ({ children, ref, ...props }: TooltipContentProps) => (
  <PopoverContent {...props} className={classNames('tooltip-content', props.className)} ref={ref}>
    {typeof children === 'string' ? (
      <Text className='whitespace-nowrap' inherit>
        {children}
      </Text>
    ) : (
      children
    )}
  </PopoverContent>
);
