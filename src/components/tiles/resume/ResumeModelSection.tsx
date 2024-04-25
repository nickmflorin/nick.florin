import clsx from "clsx";

import { type ComponentProps } from "~/components/types";
import type { FontSize } from "~/components/typography";
import { Label } from "~/components/typography/Label";

export interface ResumeModelSectionProps extends ComponentProps {
  readonly children: JSX.Element;
  readonly label: string;
  readonly labelFontSize?: FontSize;
}

export const ResumeModelSection = ({
  children,
  label,
  labelFontSize = "sm",
  ...props
}: ResumeModelSectionProps): JSX.Element => (
  <div {...props} className={clsx("flex flex-col gap-[12px]", props.className)}>
    <Label fontSize={labelFontSize}>{label}</Label>
    {children}
  </div>
);
