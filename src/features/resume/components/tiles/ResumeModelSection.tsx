import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";
import { Label } from "~/components/typography";

export interface ResumeModelSectionProps extends ComponentProps {
  readonly children: JSX.Element;
  readonly label: string;
}

export const ResumeModelSection = ({
  children,
  label,
  ...props
}: ResumeModelSectionProps): JSX.Element => (
  <div {...props} className={classNames("flex flex-col gap-[10px]", props.className)}>
    <Label className="text-sm max-md:text-xs">{label}</Label>
    {children}
  </div>
);
