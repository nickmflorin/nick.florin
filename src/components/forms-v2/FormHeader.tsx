import { type ReactNode } from "react";

import { type ComponentProps, classNames } from "~/components/types";
import { Title } from "~/components/typography/Title";

export interface FormHeaderProps extends ComponentProps {
  readonly title?: string | ReactNode;
}

export const FormHeader = ({ title, ...props }: FormHeaderProps) => (
  <>
    {typeof title === "string" ? (
      <Title {...props} component="h4" className={classNames("mb-4", props.className)}>
        {title}
      </Title>
    ) : title ? (
      <div {...props} className={classNames("flex flex-col mb-4", props.className)}>
        {title}
      </div>
    ) : null}
  </>
);
