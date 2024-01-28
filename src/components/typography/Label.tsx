import clsx from "clsx";

import { type ComponentProps } from "~/components/types";
import { type FontWeight, type TypographySize } from "~/components/typography";

export interface LabelProps extends ComponentProps {
  readonly children: string | number | undefined | null | false;
  readonly size?: TypographySize;
  readonly fontWeight?: FontWeight;
}

export const Label = ({
  children,
  size,
  fontWeight,
  style,
  className,
}: LabelProps): JSX.Element => (
  <label
    style={style}
    className={clsx(
      "label",
      size && `font-size-${size}`,
      fontWeight && `font-weight-${fontWeight}`,
      className,
    )}
  >
    {children}
  </label>
);
