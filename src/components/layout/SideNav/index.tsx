import { Suspense } from "react";

import clsx from "clsx";

import { type ButtonVariant } from "~/components/buttons";
import { type ComponentProps } from "~/components/types";

import { type NavButtonItem } from "../nav";

import { SideNavItem } from "./SideNavItem";

export interface SideNavProps extends ComponentProps {
  readonly items: NavButtonItem[];
  readonly button?: ButtonVariant<"link">;
}

export const SideNav = ({ items, button: _button = "primary", ...props }: SideNavProps) => (
  <div {...props} className={clsx("flex flex-col gap-2", props.className)}>
    {items.map(({ button = _button, ...item }, index) => (
      /* Wrapped in a Suspense because useSearchParams() causes client-side rendering up to the
         closest Suspense boundary during static rendering. */
      <Suspense key={index}>
        <SideNavItem key={index} item={{ button, ...item }} />
      </Suspense>
    ))}
  </div>
);
