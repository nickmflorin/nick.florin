"use client";

import { Link, type LinkProps } from "~/components/buttons";
import { type TypographyVisibilityState } from "~/components/types";

export interface ShowMoreLinkProps extends Omit<LinkProps<"button">, "options" | "children"> {
  readonly state: TypographyVisibilityState;
}

const LinkText: { [key in TypographyVisibilityState]: string } = {
  collapsed: "Show more",
  expanded: "Show less",
};

export const ShowMoreLink = ({ state, ...props }: ShowMoreLinkProps) => (
  <Link.Primary fontSize="xs" fontWeight="regular" {...props} element="button">
    {LinkText[state]}
  </Link.Primary>
);
