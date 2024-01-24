import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export interface ResumeSectionProps extends ComponentProps {
  readonly children: JSX.Element | JSX.Element[];
}

export const ResumeSection = (props: ResumeSectionProps): JSX.Element => (
  <div {...props} className={clsx(props.className)}>
    {props.children}
  </div>
);
