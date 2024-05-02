import clsx from "clsx";

import type { ComponentProps } from "~/components/types";
import { Label } from "~/components/typography/Label";

export interface ResumeModelSectionProps extends ComponentProps {
  readonly children: JSX.Element;
  readonly label: string;
}

export const ResumeModelSection = ({
  children,
  label,
  ...props
}: ResumeModelSectionProps): JSX.Element => (
  <div {...props} className={clsx("flex flex-col gap-[10px]", props.className)}>
    <Label className="text-sm max-md:text-xs">{label}</Label>
    {children}
  </div>
);
