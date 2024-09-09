import { type ProgrammingLanguage } from "~/prisma/model";

import { type ComponentProps } from "~/components/types";

import { ProgrammingLanguageBadge } from "../ProgrammingLanguageBadge";

import { BadgeCollection } from "./BadgeCollection";

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
