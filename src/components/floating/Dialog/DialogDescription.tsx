"use client";
import { type ReactNode } from "react";

import { Description, type DescriptionProps } from "~/components/typography/Description";

export interface DialogDescriptionProps extends DescriptionProps {
  readonly children?: ReactNode;
}

export const DialogDescription = ({ children, ...props }: DialogDescriptionProps) => (
  <Description {...props}>{children}</Description>
);
