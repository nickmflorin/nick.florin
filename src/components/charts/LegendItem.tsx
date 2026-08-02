'use client';
import { Circle } from '~/components/icons/svgs';
import { classNames, type ComponentProps } from '~/components/types';
import { Label } from '~/components/typography';
import { useScreenSizes } from '~/hooks/use-screen-sizes';

export interface LegendItemProps extends ComponentProps {
  readonly color: string;
  readonly label: string;
}

export const LegendItem = ({ color, label, ...props }: LegendItemProps) => {
  const { isLessThanOrEqualTo } = useScreenSizes();
  return (
    <div
      className={classNames(
        'flex flex-row items-center gap-[3px]',
        { 'h-[16px]': isLessThanOrEqualTo('sm'), 'h-[18px]': !isLessThanOrEqualTo('sm') },
        props.className,
      )}
    >
      <Circle color={color} size={isLessThanOrEqualTo('sm') ? 16 : 18} />
      <Label
        className={classNames({
          'leading-[16px]': isLessThanOrEqualTo('sm'),
          'leading-[18px]': !isLessThanOrEqualTo('sm'),
        })}
        fontFamily='inter'
        fontSize={isLessThanOrEqualTo('sm') ? 'xs' : 'sm'}
        fontWeight='regular'
        truncate
      >
        {label}
      </Label>
    </div>
  );
};
