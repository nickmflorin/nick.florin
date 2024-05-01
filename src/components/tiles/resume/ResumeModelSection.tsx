import clsx from "clsx";

import type { BodyFontSize, ComponentProps } from "~/components/types";
import { Label } from "~/components/typography/Label";

export interface ResumeModelSectionProps extends ComponentProps {
  readonly children: JSX.Element;
  readonly label: string;
  readonly labelFontSize?: BodyFontSize;
}

export const ResumeModelSection = ({
  children,
  label,
  labelFontSize = "sm",
  ...props
}: ResumeModelSectionProps): JSX.Element => (
  <div {...props} className={clsx("flex flex-col gap-[10px]", props.className)}>
    <Label fontSize={labelFontSize}>{label}</Label>
    {children}
  </div>
);