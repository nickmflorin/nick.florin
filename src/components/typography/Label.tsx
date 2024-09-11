import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";
import {
  type TypographyCharacteristics,
  getTypographyClassName,
} from "~/components/types/typography";

export interface LabelProps extends TypographyCharacteristics, ComponentProps {
  readonly children: React.ReactNode;
  readonly dark?: boolean;
}

export const Label = ({ children, style, dark, ...props }: LabelProps): JSX.Element => (
  <label
    style={style}
    className={classNames(
      "label",
      { "label--dark": dark },
      getTypographyClassName(props),
      props.className,
    )}
  >
    {children}
  </label>
);
