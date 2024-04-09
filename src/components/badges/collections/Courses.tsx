"use client";
import { type BrandCourse } from "~/prisma/model";
import { useDrawers } from "~/components/drawers/hooks";
import { type ComponentProps } from "~/components/types";

import { CourseBadge } from "../CourseBadge";

import { BadgeCollection } from "./BadgeCollection";

export interface CoursesProps extends ComponentProps {
  readonly courses: BrandCourse[];
}

export const Courses = ({ courses, ...props }: CoursesProps): JSX.Element => {
  const { open, ids } = useDrawers();
  if (courses.length === 0) {
    return <></>;
  }
  return (
    <BadgeCollection {...props}>
      {courses.map(course => (
        <CourseBadge
          key={course.id}
          course={course}
          onClick={() => open(ids.VIEW_COURSE, { courseId: course.id })}
        />
      ))}
    </BadgeCollection>
  );
};
