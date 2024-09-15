import { type ProgrammingDomain, getProgrammingDomain } from "~/prisma/model";

import { Badge, type BadgeProps } from "~/components/badges/Badge";
import { classNames } from "~/components/types";

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
