import { type ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";
import { Text } from "~/components/typography/Text";

export interface SectionProps extends ComponentProps {
  readonly title?: JSX.Element | string;
  readonly description?: JSX.Element | string;
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
    size="smplus"
    className={clsx("text-body", props.className)}
  >
    {children}
  </Text>
);

export const SectionDescription = ({
  children,
  ...props
}: ComponentProps & { readonly children: ReactNode }) => (
  <Text {...props} className={clsx("text-body-light", props.className)} size="smplus">
    {children}
  </Text>
);

export const Section = ({ title, description, children, ...props }: SectionProps) => (
  <div {...props} className={clsx("flex flex-col gap-[12px]", props.className)}>
    {(title || description) && (
      <div className="flex flex-col gap-[4px] mb-[4px]">
        {typeof title === "string" ? <SectionTitle>{title}</SectionTitle> : title}
        {typeof description === "string" ? (
          <SectionDescription>{description}</SectionDescription>
        ) : (
          description
        )}
      </div>
    )}
    {children}
  </div>
);
