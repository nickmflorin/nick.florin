import { Description, type DescriptionProps } from "~/components/typography/Description";

export interface DialogDescriptionProps extends DescriptionProps<"div"> {}

export const DialogDescription = ({ children, ...props }: DialogDescriptionProps) => (
  <Description {...props}>{children}</Description>
);
