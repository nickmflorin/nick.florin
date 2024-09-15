import { type ProgrammingLanguage } from "~/prisma/model";

import { BadgeCollection } from "~/components/badges/BadgeCollection";
import { type ComponentProps } from "~/components/types";

import { ProgrammingLanguageBadge } from "./ProgrammingLanguageBadge";

export interface ProgrammingLanguagesProps extends ComponentProps {
  readonly languages: ProgrammingLanguage[];
}

export const ProgrammingLanguages = ({
  languages,
  ...props
}: ProgrammingLanguagesProps): JSX.Element => (
  <BadgeCollection {...props}>
    {languages.map(l => (
      <ProgrammingLanguageBadge key={l.toLowerCase()} language={l} />
    ))}
  </BadgeCollection>
);
