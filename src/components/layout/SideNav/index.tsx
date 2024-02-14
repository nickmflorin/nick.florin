import dynamic from "next/dynamic";

import clsx from "clsx";

import { type ButtonVariant } from "~/components/buttons";
import { type ComponentProps } from "~/components/types";

import { type NavButtonItem } from "../nav";

const SideNavItem = dynamic(() => import("./SideNavItem"), {
  ssr: true,
});

export interface SideNavProps extends ComponentProps {
  readonly items: NavButtonItem[];
  readonly button?: ButtonVariant<"link">;
}

export const SideNav = ({ items, button: _button = "primary", ...props }: SideNavProps) => (
  <div {...props} className={clsx("flex flex-col gap-2", props.className)}>
    {items.map(({ button = _button, ...item }, index) => (
      <SideNavItem key={index} item={{ button, ...item }} />
    ))}
  </div>
);
