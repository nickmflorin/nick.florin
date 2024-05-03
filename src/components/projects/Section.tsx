import { type ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps, type SingleTextNode } from "~/components/types";
import { Description } from "~/components/typography/Description";
import { Text } from "~/components/typography/Text";

export interface SectionProps extends ComponentProps {
  readonly title?: JSX.Element | string;
  readonly description?: SingleTextNode | SingleTextNode[];
  readonly children: ReactNode;
}

export const SectionTitle = ({
  children,
  ...props
}: ComponentProps & { readonly children: ReactNode }) => (
  <Text
    {...props}
    fontWeight="medium"
    flex
    className={clsx("text-sm max-sm:text-xs", props.className)}
  >
    {children}
  </Text>
);

export const Section = ({ title, description, children, ...props }: SectionProps) => (
  <div {...props} className={clsx("flex flex-col gap-[12px] max-md:gap-[8px]", props.className)}>
    {(title || description) && (
      <div className="flex flex-col gap-[4px] mb-[4px]">
        {typeof title === "string" ? <SectionTitle>{title}</SectionTitle> : title}
        {typeof description === "string" ? <Description>{description}</Description> : description}
      </div>
    )}
    {children}
  </div>
);
