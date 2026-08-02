import { type JSX, type ReactNode } from 'react';

import { classNames, type ComponentProps } from '~/components/types';
import { Description, Text } from '~/components/typography';

export interface SectionProps extends ComponentProps {
  readonly children?: ReactNode;
  readonly description?: ReactNode;
  readonly hasMarginBottom?: boolean;
  readonly isSubSection?: boolean;
  readonly title?: JSX.Element | string;
}

export const SectionTitle = ({
  children,
  isSubSection = false,
  ...props
}: { readonly children: ReactNode; readonly isSubSection?: boolean } & ComponentProps) => (
  <Text
    {...props}
    className={classNames(
      { 'text-md max-sm:text-sm': !isSubSection, 'text-sm max-sm:text-xs': isSubSection },
      props.className,
    )}
    fontWeight='medium'
  >
    {children}
  </Text>
);

export const Section = ({
  children,
  description,
  hasMarginBottom = true,
  isSubSection,
  title,
  ...props
}: SectionProps) => (
  <div
    {...props}
    className={classNames('flex flex-col gap-[12px] max-md:gap-[8px]', props.className)}
  >
    {(title || description) && (
      <div className={classNames('flex flex-col gap-[4px]', { 'mb-[4px]': hasMarginBottom })}>
        {typeof title === 'string' ? (
          <SectionTitle isSubSection={isSubSection}>{title}</SectionTitle>
        ) : (
          title
        )}
        {typeof description === 'string' ? <Description>{description}</Description> : description}
      </div>
    )}
    {children}
  </div>
);
