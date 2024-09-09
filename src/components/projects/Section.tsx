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
  readonly subSection?: boolean;
}

export const SectionTitle = ({
  children,
  subSection = false,
  ...props
}: ComponentProps & { readonly children: ReactNode; readonly subSection?: boolean }) => (
  <Text
    {...props}
    fontWeight="medium"
    flex
    className={clsx(
      { "text-md max-sm:text-sm": !subSection, "text-sm max-sm:text-xs": subSection },
      props.className,
    )}
  >
    {children}
  </Text>
);

export const Section = ({
  title,
  description,
  children,
  marginBottom = true,
  subSection,
  ...props
}: SectionProps) => (
  <div {...props} className={clsx("flex flex-col gap-[12px] max-md:gap-[8px]", props.className)}>
    {(title || description) && (
      <div className={clsx("flex flex-col gap-[4px]", { "mb-[4px]": marginBottom })}>
        {typeof title === "string" ? (
          <SectionTitle subSection={subSection}>{title}</SectionTitle>
        ) : (
          title
        )}
        {typeof description === "string" ? <Description>{description}</Description> : description}
      </div>
    )}
    {children}
  </div>
);
