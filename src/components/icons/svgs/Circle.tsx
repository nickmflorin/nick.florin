import { type HexColor } from '~/lib/colors';

import { classNames, type ComponentProps } from '~/components/types';

export type CircleProps = {
  readonly color?: string;
  readonly isSelectable?: boolean;
  readonly isSelected?: boolean;
  readonly selectedColor?: HexColor;
  readonly size: number;
} & ComponentProps;

export const Circle = ({
  color,
  isSelectable = false,
  isSelected,
  selectedColor = '#6eb6ff',
  size,
  ...props
}: CircleProps) => (
  <svg
    {...props}
    className={classNames('icon', props.className)}
    style={{ ...props.style, height: `${size}px`, width: `${size}px` }}
  >
    {(isSelectable || isSelected !== undefined) && (
      <rect
        fill={isSelected ? selectedColor : 'transparent'}
        height={size}
        rx={size / 2}
        ry={size / 2}
        width={size}
      />
    )}
    <circle cx={size / 2} cy={size / 2} fill={color} r={size / 2 - 1} />
  </svg>
);
