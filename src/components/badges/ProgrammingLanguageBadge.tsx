import clsx from "clsx";

import { type ProgrammingLanguage, getProgrammingLanguage } from "~/prisma/model";

import { Badge, type BadgeProps } from "./Badge";

export interface ProgrammingLanguageBadgeProps extends Omit<BadgeProps, "children"> {
  readonly language: ProgrammingLanguage;
}

export const ProgrammingLanguageBadge = ({
  language,
  ...props
}: ProgrammingLanguageBadgeProps): JSX.Element => (
  <Badge {...props} className={clsx("bg-green-100 text-green-800", props.className)}>
    {getProgrammingLanguage(language).label}
  </Badge>
);
