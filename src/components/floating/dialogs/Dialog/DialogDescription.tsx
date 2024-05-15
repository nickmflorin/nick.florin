"use client";
import { Description, type DescriptionProps } from "~/components/typography/Description";

export interface DialogDescriptionProps extends DescriptionProps {}

export const DialogDescription = ({ children, ...props }: DialogDescriptionProps) => (
  <Description {...props}>{children}</Description>
);
