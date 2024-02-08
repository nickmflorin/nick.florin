import clsx from "clsx";

import { Floating, type FloatingProps } from "./Floating";

export interface TooltipProps extends Omit<FloatingProps, "content"> {
  readonly content: string;
}

export const Tooltip = ({ children, content, ...props }: TooltipProps) => (
  <Floating
    {...props}
    content={content}
    contentClassName={clsx(
      "bg-blue-500 text-white rounded-sm py-[4px] px-[6px] text-xs leading-[14px] z-50",
      props.contentClassName,
    )}
  >
    {children}
  </Floating>
);
