import clsx from "clsx";

import { type Course } from "~/prisma/model";

import { Badge, type BadgeProps } from "./Badge";

export interface CourseBadgeProps extends Omit<BadgeProps, "children" | "icon" | "iconClassName"> {
  readonly course: Pick<Course, "name" | "id">;
}

export const CourseBadge = ({ course, ...props }: CourseBadgeProps): JSX.Element => (
  <Badge
    fontSize="xs"
    {...props}
    className={clsx("bg-orange-100 text-orange-500 hover:bg-orange-200", props.className)}
  >
    {course.name}
  </Badge>
);
