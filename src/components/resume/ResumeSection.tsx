import clsx from "clsx";

import { type ClassName, type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography/Title";

export interface ResumeSectionProps extends ComponentProps {
  readonly children: JSX.Element | JSX.Element[];
  readonly title: string;
  readonly contentClassName?: ClassName;
}

export const ResumeSection = ({
  title,
  contentClassName,
  ...props
}: ResumeSectionProps): JSX.Element => (
  <div {...props} className={clsx("flex flex-col gap-[12px] max-w-[600px]", props.className)}>
    <Title order={3}>{title}</Title>
    <div className={clsx("flex flex-col", contentClassName)}>{props.children}</div>
  </div>
);
