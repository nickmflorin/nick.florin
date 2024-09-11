import { type ProgrammingDomain, getProgrammingDomain } from "~/prisma/model";

import { classNames } from "~/components/types";

import { Badge, type BadgeProps } from "./Badge";

export interface ProgrammingDomainBadgeProps extends Omit<BadgeProps, "children"> {
  readonly domain: ProgrammingDomain;
}

export const ProgrammingDomainBadge = ({
  domain,
  ...props
}: ProgrammingDomainBadgeProps): JSX.Element => (
  <Badge {...props} className={classNames("bg-yellow-100 text-yellow-800", props.className)}>
    {getProgrammingDomain(domain).label}
  </Badge>
);
