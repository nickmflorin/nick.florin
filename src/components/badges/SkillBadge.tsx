"use client";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import clsx from "clsx";

import { type Skill } from "~/prisma/model";

import { Badge, type BadgeProps } from "./Badge";

export interface SkillBadgeProps extends Omit<BadgeProps, "children" | "icon" | "iconClassName"> {
  readonly skill: Pick<Skill, "label" | "id">;
}

export const SkillBadge = ({ skill, ...props }: SkillBadgeProps): JSX.Element => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  return (
    <Badge
      size="xs"
      {...props}
      className={clsx("bg-blue-100 text-blue-500 hover:bg-blue-200", props.className)}
      onClick={() => {
        const params = new URLSearchParams(searchParams?.toString());
        params.set("skillId", skill.id);
        replace(`${pathname}?${params.toString()}`);
      }}
    >
      {skill.label}
    </Badge>
  );
};
