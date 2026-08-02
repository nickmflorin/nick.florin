'use client';
import { memo, type ReactNode, useMemo } from 'react';

import { isEqual } from 'lodash-es';

import { type BrandCourse } from '~/database/model';

import { InlineLink } from '~/components/buttons';
import { useDrawers } from '~/components/drawers/hooks/use-drawers';
import { Text } from '~/components/typography';

interface CourseLinkProps {
  readonly course: BrandCourse;
}

const CourseLink = ({ course }: CourseLinkProps) => {
  const { ids, open } = useDrawers();
  return (
    <InlineLink
      element='a'
      fontWeight='regular'
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
      return [<CourseLink course={courses[0]} key={courses[0].id} />];
    } else if (courses.length === 2) {
      return [
        <CourseLink course={courses[0]} key={courses[0].id} />,
        <Text component='span' key={`${courses[0].id}_break`}>
          &nbsp;and&nbsp;
        </Text>,
        <CourseLink course={courses[1]} key={courses[1].id} />,
      ];
    }
    const partial: ReactNode[] = courses.slice(0, courses.length - 2).flatMap(course => [
      <CourseLink course={course} key={course.id} />,
      <Text component='span' key={`${course.id}_break`}>
        ,&nbsp;
      </Text>,
    ]);
    return [
      ...partial,
      <CourseLink course={courses[courses.length - 2]} key={courses[courses.length - 2].id} />,
      <Text component='span' key={`${courses[courses.length - 2].id}_break`}>
        &nbsp;and&nbsp;
      </Text>,
      <CourseLink course={courses[courses.length - 1]} key={courses[courses.length - 1].id} />,
      <Text component='span' key={`${courses[courses.length - 1].id}_break`}>
        .
      </Text>,
    ];
  }, [courses]);

  if (humanized.length === 0) {
    return null;
  }
  return <>{humanized}</>;
}, isEqual);
