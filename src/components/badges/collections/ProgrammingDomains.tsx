import { type ProgrammingDomain } from "~/prisma/model";
import { type ComponentProps } from "~/components/types";

import { ProgrammingDomainBadge } from "../ProgrammingDomainBadge";

import { BadgeCollection } from "./BadgeCollection";

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
