import dynamic from 'next/dynamic';
import { type JSX, type ReactNode } from 'react';

import { Link } from '~/components/buttons/generic/Link';
import { Content } from '~/components/layout/Content';
import { Module } from '~/components/structural/Module';
import { classNames, type ComponentProps } from '~/components/types';

const Tour = dynamic(() => import('~/components/tours/Tour').then(mod => mod.Tour));

/**
 * The minimum width applied to the chart module between the 'md' and 'lg' breakpoints.  The 652px
 * comes from 2(320px for each column) + 12px for gap = 652px.
 */
const ChartModuleMinWidth = 'md:max-lg:min-w-[652px]';

/**
 * The gap between the education items in the education module.  The 12px gap is left even for
 * max-md cases, because an 8px gap between the education items looks a little "squished".
 */
const EducationItemsGap = 'gap-[12px]';

interface ColumnProps extends ComponentProps {
  readonly children: ReactNode;
}

const Column = ({ children, ...props }: ColumnProps): JSX.Element => (
  <div
    {...props}
    className={classNames(
      'flex flex-col gap-[12px] lg:min-w-[320px]',
      'max-xl:w-[50%] max-xl:max-w-[50%]',
      'max-md:w-full max-md:max-w-full',
      props.className,
    )}
  >
    {children}
  </div>
);

export interface DashboardPageProps {
  readonly chart: ReactNode;
  readonly educations: ReactNode;
  readonly experiences: ReactNode;
  readonly projects: ReactNode;
  readonly repositories: ReactNode;
}

const DashboardPage = ({
  chart,
  educations,
  experiences,
  projects,
  repositories,
}: DashboardPageProps) => (
  <>
    <Tour />
    <Content isScrollable>
      <div
        className={classNames(
          'flex gap-[12px]',
          'xl:flex-row',
          'max-xl:flex-col',
          'pb-[16px] max-md:pb-[12px] max-sm:pb-[8px]',
        )}
      >
        <Module className={classNames(ChartModuleMinWidth, 'xl:max-w-[1000px] lg:min-w-[320px]')}>
          {chart}
        </Module>
        <div className={classNames('flex gap-[12px]', 'md:flex-row md:grow', 'max-md:flex-col')}>
          <Column className='md:flex-1'>
            <Module className='xl:overflow-y-hidden grow' data-attr-tour-id='recent-experience'>
              <Module.Header
                actions={[
                  <Link
                    element='link'
                    fontSize='xs'
                    fontWeight='medium'
                    href='/resume/experience'
                    key='0'
                  >
                    View All
                  </Link>,
                ]}
              >
                Recent Experiences
              </Module.Header>
              <Module.Content
                className={classNames(
                  'flex flex-col gap-[12px] max-md:gap-[8px]',
                  'xl:overflow-y-auto xl:pr-[16px]',
                )}
              >
                {experiences}
              </Module.Content>
            </Module>
            <Module className='min-h-[200px]'>
              <Module.Header>Projects</Module.Header>
              <Module.Content
                className={classNames(
                  'flex flex-col gap-[12px]',
                  'max-md:gap-[8px]',
                  'xl:overflow-y-auto xl:grow xl:pr-[16px]',
                )}
              >
                {projects}
              </Module.Content>
            </Module>
          </Column>
          <Column className='md:flex-1'>
            <Module className='xl:overflow-y-hidden min-h-[200px]'>
              <Module.Header
                actions={[
                  <Link
                    element='link'
                    fontSize='xs'
                    fontWeight='medium'
                    href='/resume/education'
                    key='0'
                  >
                    View All
                  </Link>,
                ]}
              >
                Education
              </Module.Header>
              <Module.Content
                className={classNames(
                  'flex flex-col',
                  EducationItemsGap,
                  'xl:overflow-y-auto xl:grow xl:pr-[16px]',
                )}
              >
                {educations}
              </Module.Content>
            </Module>
            <Module className='xl:overflow-y-hidden grow min-h-[200px]'>
              <Module.Header>Repositories</Module.Header>
              <Module.Content
                className={classNames(
                  'flex flex-col max-md:gap-[8px] xl:overflow-y-auto xl:grow xl:pr-[16px]',
                )}
              >
                {repositories}
              </Module.Content>
            </Module>
          </Column>
        </div>
      </div>
    </Content>
  </>
);

export default DashboardPage;
