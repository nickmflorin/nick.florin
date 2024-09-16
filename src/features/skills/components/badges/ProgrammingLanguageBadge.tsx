import { type ProgrammingLanguage, ProgrammingLanguages } from "~/prisma/model";

import { Badge, type BadgeProps } from "~/components/badges/Badge";
import { classNames } from "~/components/types";

export interface ProgrammingLanguageBadgeProps extends Omit<BadgeProps, "children"> {
  readonly language: ProgrammingLanguage;
}

export const ProgrammingLanguageBadge = ({
  language,
  ...props
}: ProgrammingLanguageBadgeProps): JSX.Element => {
  const config = ProgrammingLanguages.getModel(language);
  return (
    <Badge
      {...props}
      className={classNames("bg-white text-body border", props.className)}
      icon={config.icon}
    >
      {config.label}
    </Badge>
  );
};
