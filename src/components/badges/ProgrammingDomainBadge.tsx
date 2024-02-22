import clsx from "clsx";

import { type ProgrammingDomain, getProgrammingDomain } from "~/prisma/model";

import { Badge, type BadgeProps } from "./Badge";

export interface ProgrammingDomainBadgeProps extends Omit<BadgeProps, "children"> {
  readonly domain: ProgrammingDomain;
}

export const ProgrammingDomainBadge = ({
  domain,
  ...props
}: ProgrammingDomainBadgeProps): JSX.Element => (
  <Badge {...props} className={clsx("bg-yellow-100 text-yellow-800", props.className)}>
    {getProgrammingDomain(domain).label}
  </Badge>
);
