import { type ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";
import { type SingleTextNode } from "~/components/types/typography";
import { Description } from "~/components/typography/Description";
import { Text } from "~/components/typography/Text";

export interface SectionProps extends ComponentProps {
  readonly title?: JSX.Element | string;
  readonly description?: SingleTextNode | SingleTextNode[];
  readonly children?: ReactNode;
  readonly marginBottom?: boolean;
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

export const Section = ({
  title,
  description,
  children,
  marginBottom = true,
  ...props
}: SectionProps) => (
  <div {...props} className={clsx("flex flex-col gap-[12px] max-md:gap-[8px]", props.className)}>
    {(title || description) && (
      <div className={clsx("flex flex-col gap-[4px]", { "mb-[4px]": marginBottom })}>
        {typeof title === "string" ? <SectionTitle>{title}</SectionTitle> : title}
        {typeof description === "string" ? <Description>{description}</Description> : description}
      </div>
    )}
    {children}
  </div>
);
