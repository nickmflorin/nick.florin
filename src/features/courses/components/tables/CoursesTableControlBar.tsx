'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useState, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { deleteCourses } from '~/actions/courses/delete-courses';
import { hideCourses } from '~/actions/courses/hide-courses';
import { showCourses } from '~/actions/courses/show-courses';

import { HideButton } from '~/components/buttons/HideButton';
import { ShowButton } from '~/components/buttons/ShowButton';
import { Tooltip } from '~/components/floating/Tooltip';
import {
  ConnectedTableControlBar,
  type ConnectedTableControlBarProps,
} from '~/components/tables/ConnectedTableControlBar';
import { type CoursesTableColumn, type CoursesTableModel } from '~/features/courses';

export interface CoursesTableControlBarProps extends Omit<
  ConnectedTableControlBarProps<CoursesTableModel, CoursesTableColumn>,
  'children' | 'confirmationModal' | 'deleteAction' | 'modelName'
> {}

export const CoursesTableControlBar = (props: CoursesTableControlBarProps): JSX.Element => {
  const router = useRouter();

  const [isHiding, setIsHiding] = useState(false);
  const [isShowing, setIsShowing] = useState(false);

  const [_, transition] = useTransition();

  return (
    <ConnectedTableControlBar
      {...props}
      data={props.data}
      deleteAction={deleteCourses}
      modelName='course'
    >
      {({ selectedRows }) => {
        const numVisible = selectedRows.filter(row => row.visible).length;
        const numHidden = selectedRows.filter(row => !row.visible).length;
        return (
          <>
            <Tooltip
              className='text-sm'
              content={`Show ${numHidden} selected experience${numHidden <= 1 ? '' : 's'}.`}
              isDisabled={numHidden === 0 || props.isDisabled === true}
              isInPortal={props.areTooltipsInPortal}
              offset={{ mainAxis: 6 }}
              placement='top-start'
            >
              <ShowButton
                isDisabled={numHidden === 0 || props.isDisabled}
                isLoading={isShowing}
                onClick={async () => {
                  let response: Awaited<ReturnType<typeof showCourses>> | null = null;
                  setIsShowing(true);
                  try {
                    response = await showCourses(
                      selectedRows.filter(row => !row.visible).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, 'There was an error showing the courses.', {
                      courses: selectedRows.filter(row => !row.visible).map(row => row.id),
                    });
                    setIsShowing(false);
                    return toast.error('There was an error updating the courses.');
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, 'There was an error showing the courses.', {
                      courses: selectedRows.filter(row => !row.visible).map(row => row.id),
                    });
                    setIsShowing(false);
                    return toast.error('There was an updating the courses.');
                  }
                  transition(() => {
                    router.refresh();
                    setIsShowing(false);
                    toast.success('The courses have been made visible.');
                  });
                }}
              />
            </Tooltip>
            <Tooltip
              className='text-sm'
              content={`Hide ${numVisible} selected experience${numVisible <= 1 ? '' : 's'}.`}
              isDisabled={numVisible === 0 || props.isDisabled === true}
              isInPortal={props.areTooltipsInPortal}
              offset={{ mainAxis: 6 }}
              placement='top-start'
            >
              <HideButton
                isDisabled={numVisible === 0 || props.isDisabled}
                isLoading={isHiding}
                onClick={async () => {
                  let response: Awaited<ReturnType<typeof hideCourses>> | null = null;
                  setIsHiding(true);
                  try {
                    response = await hideCourses(
                      selectedRows.filter(row => row.visible).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, 'There was an error hiding the courses.', {
                      courses: selectedRows.filter(row => row.visible).map(row => row.id),
                    });
                    setIsHiding(false);
                    return toast.error('There was an updating the courses.');
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, 'There was an error hiding the courses.', {
                      courses: selectedRows.filter(row => row.visible).map(row => row.id),
                    });
                    setIsHiding(false);
                    return toast.error('There was an updating the courses.');
                  }
                  transition(() => {
                    router.refresh();
                    setIsHiding(false);
                    toast.success('The courses have been hidden.');
                  });
                }}
              />
            </Tooltip>
          </>
        );
      }}
    </ConnectedTableControlBar>
  );
};
