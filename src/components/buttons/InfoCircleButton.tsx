import { type ReactNode } from "react";

import { Tooltip } from "~/components/floating/Tooltip";
import { type ComponentProps } from "~/components/types";

import { InfoCircle, type InfoCircleProps } from "../icons/svgs/InfoCircle";

import { IconButton } from "./generic";

export interface InfoCircleButtonProps extends ComponentProps, Pick<InfoCircleProps, "size"> {
  readonly children: ReactNode;
}

export const InfoCircleButton = ({ children, size = 22, ...props }: InfoCircleButtonProps) => (
  <Tooltip
    content={children}
    triggers={["click"]}
    variant="white"
    className="px-[12px] py-[10px] text-xs font-regular text-blue-400"
  >
    <IconButton.Bare
      {...props}
      className="group"
      icon={<InfoCircle size={size} circleClassName="fill-gray-200 group-hover:fill-gray-300" />}
      style={{ height: `${size}px`, width: `${size}px`, minHeight: `${size}px` }}
    />
  </Tooltip>
);
