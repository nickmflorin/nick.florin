import type { ReactNode } from "react";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { Description } from "~/components/typography/Description";
import { Label } from "~/components/typography/Label";

export interface TourContentProps extends ComponentProps {
  readonly label?: ReactNode;
  readonly children: ReactNode;
}

export const TourContent = ({ label, children, ...props }: TourContentProps) => (
  <div {...props} className={classNames("tour__content", props.className)}>
    {typeof label === "string" ? <Label fontSize="sm">{label}</Label> : label}
    {typeof children === "string" ? <Description fontSize="xs">{children}</Description> : children}
  </div>
);
