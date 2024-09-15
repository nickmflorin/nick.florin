"use client";
import React, { memo, useMemo, type ReactNode } from "react";

import { isEqual } from "lodash-es";

import type { BrandCourse } from "~/prisma/model";

import { InlineLink } from "~/components/buttons";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import { Text } from "~/components/typography";

interface CourseLinkProps {
  readonly course: BrandCourse;
}

const CourseLink = ({ course }: CourseLinkProps) => {
  const { open, ids } = useDrawers();
  return (
    <InlineLink
      element="a"
      fontWeight="regular"
      onClick={() => open(ids.VIEW_COURSE, { courseId: course.id })}
    >
      {course.name}
    </InlineLink>
  );
};

export interface HumanizedCoursesProps {
  readonly courses: BrandCourse[];
}

export const HumanizedCourses = memo(({ courses }: HumanizedCoursesProps) => {
  const humanized = useMemo(() => {
    if (courses.length === 0) {
      return [];
    } else if (courses.length === 1) {
      return [<CourseLink key={courses[0].id} course={courses[0]} />];
    } else if (courses.length === 2) {
      return [
        <CourseLink key={courses[0].id} course={courses[0]} />,
        <Text key={`${courses[0].id}_break`} component="span">
          &nbsp;and&nbsp;
        </Text>,
        <CourseLink key={courses[1].id} course={courses[1]} />,
      ];
    }
    const partial: ReactNode[] = courses.slice(0, courses.length - 2).flatMap(course => [
      <CourseLink key={course.id} course={course} />,
      <Text key={`${course.id}_break`} component="span">
        ,&nbsp;
      </Text>,
    ]);
    return [
      ...partial,
      <CourseLink key={courses[courses.length - 2].id} course={courses[courses.length - 2]} />,
      <Text key={`${courses[courses.length - 2].id}_break`} component="span">
        &nbsp;and&nbsp;
      </Text>,
      <CourseLink key={courses[courses.length - 1].id} course={courses[courses.length - 1]} />,
      <Text key={`${courses[courses.length - 1].id}_break`} component="span">
        .
      </Text>,
    ];
  }, [courses]);

  if (humanized.length === 0) {
    return <></>;
  }
  return (
    <>
      Coursework included&nbsp;
      <>{humanized}</>
    </>
  );
}, isEqual);
