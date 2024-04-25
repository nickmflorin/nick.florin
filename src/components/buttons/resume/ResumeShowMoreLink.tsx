"use client";

import { Link, type LinkProps } from "~/components/buttons";
import { type TypographyVisibilityState } from "~/components/typography";

export interface ResumeShowMoreLinkProps
  extends Omit<LinkProps<{ as: "button" }>, "options" | "flex" | "children"> {
  readonly state: TypographyVisibilityState;
}

const LinkText: { [key in TypographyVisibilityState]: string } = {
  collapsed: "Show more",
  expanded: "Show less",
};

export const ResumeShowMoreLink = ({ state, ...props }: ResumeShowMoreLinkProps) => (
  <Link.Primary fontSize="xs" fontWeight="regular" {...props} options={{ as: "button" }} flex>
    {LinkText[state]}
  </Link.Primary>
);
