"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { IconButton, type IconButtonProps } from "./generic";

export interface DrawerCloseButtonProps extends IconButtonProps<{ as: "button" }> {
  readonly param?: string;
}

export const DrawerCloseButton = ({
  param,
  onClick,
  ...props
}: DrawerCloseButtonProps): JSX.Element => {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (param) {
        const params = new URLSearchParams(searchParams?.toString());
        params.delete(param);
        replace(`${pathname}?${params.toString()}`);
      }
      onClick?.(e);
    },
    [param, pathname, replace, searchParams, onClick],
  );

  return (
    <IconButton.Transparent
      {...props}
      options={{ as: "button" }}
      size="xsmall"
      iconSize="large"
      icon={{ name: "xmark", iconStyle: "solid" }}
      className="drawer__close-button text-gray-500 hover:text-gray-600 hover:bg-gray-200"
      onClick={e => handleClick(e)}
    />
  );
};

export default DrawerCloseButton;
