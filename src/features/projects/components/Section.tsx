import { type ReactNode } from "react";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { Text, Description } from "~/components/typography";

export interface SectionProps extends ComponentProps {
  readonly title?: JSX.Element | string;
  readonly description?: ReactNode;
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
    className={classNames(
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
  <div
    {...props}
    className={classNames("flex flex-col gap-[12px] max-md:gap-[8px]", props.className)}
  >
    {(title || description) && (
      <div className={classNames("flex flex-col gap-[4px]", { "mb-[4px]": marginBottom })}>
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
