import { type ProgrammingDomain } from "~/prisma/model";

import { BadgeCollection } from "~/components/badges/BadgeCollection";
import { type ComponentProps } from "~/components/types";

import { ProgrammingDomainBadge } from "./ProgrammingDomainBadge";

export interface ProgrammingDomainsProps extends ComponentProps {
  readonly domains: ProgrammingDomain[];
}

export const ProgrammingDomains = ({ domains, ...props }: ProgrammingDomainsProps): JSX.Element => (
  <BadgeCollection {...props}>
    {domains.map(d => (
      <ProgrammingDomainBadge key={d.toLowerCase()} domain={d} />
    ))}
  </BadgeCollection>
);
