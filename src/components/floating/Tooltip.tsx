import { type ReactNode } from "react";

import { Text } from "~/components/typography/Text";

import { Floating, type FloatingProps } from "./Floating";

export interface TooltipProps extends Omit<FloatingProps, "content"> {
  readonly content: ReactNode;
}

export const Tooltip = ({ children, content, ...props }: TooltipProps) => (
  <Floating
    {...props}
    content={
      typeof content === "string" ? <Text className="whitespace-nowrap">{content}</Text> : content
    }
  >
    {children}
  </Floating>
);
