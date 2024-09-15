import { type Course } from "~/prisma/model";

import { Badge, type BadgeProps } from "~/components/badges/Badge";
import { classNames } from "~/components/types";

export interface CourseBadgeProps extends Omit<BadgeProps, "children" | "icon" | "iconClassName"> {
  readonly course: Pick<Course, "name" | "id">;
}

/**
 * @deprecated
 */
export const CourseBadge = ({ course, ...props }: CourseBadgeProps): JSX.Element => (
  <Badge
    fontSize="xs"
    {...props}
    className={classNames("bg-blue-500 text-white hover:bg-blue-400", props.className)}
  >
    {course.name}
  </Badge>
);
