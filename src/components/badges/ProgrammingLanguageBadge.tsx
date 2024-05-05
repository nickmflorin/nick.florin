import clsx from "clsx";

import { type ProgrammingLanguage, getProgrammingLanguage } from "~/prisma/model";

import { Badge, type BadgeProps } from "./Badge";

export interface ProgrammingLanguageBadgeProps extends Omit<BadgeProps, "children"> {
  readonly language: ProgrammingLanguage;
}

export const ProgrammingLanguageBadge = ({
  language,
  ...props
}: ProgrammingLanguageBadgeProps): JSX.Element => {
  const config = getProgrammingLanguage(language);
  return (
    <Badge
      {...props}
      className={clsx("bg-white text-text border", props.className)}
      icon={config.icon}
    >
      {config.label}
    </Badge>
  );
};
