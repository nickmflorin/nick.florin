"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

import { IconButton, type IconButtonProps } from "./generic";

export interface DrawerCloseButtonProps extends IconButtonProps<{ as: "button" }> {
  readonly param: string;
}

export const DrawerCloseButton = ({ param, ...props }: DrawerCloseButtonProps): JSX.Element => {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClick = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete(param);
    replace(`${pathname}?${params.toString()}`);
  }, [param, pathname, replace, searchParams]);

  return (
    <IconButton.Transparent
      {...props}
      options={{ as: "button" }}
      size="xsmall"
      iconSize="large"
      icon={{ name: "xmark", iconStyle: "solid" }}
      className="drawer__close-button text-gray-500 hover:text-gray-600 hover:bg-gray-200"
      onClick={() => handleClick()}
    />
  );
};
