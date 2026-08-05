import { type JSX, type ReactNode } from 'react';

import { Link } from '~/components/buttons/generic/Link';
import { Content } from '~/components/layout/Content';
import { Module } from '~/components/structural/Module';
import { Tour } from '~/components/tours/Tour';
import { classNames, type ComponentProps } from '~/components/types';

/* At 'xl' and above the layout is deterministic for a given viewport: the grid fills the
   viewport-derived content area with fixed fractional tracks, and module content scrolls internally
   rather than sizing its module — nothing inside a module (skeletons, streamed slot content, the
   chart mounting) can change a module's dimensions, so the layout is final at first paint. Below
   'xl' the page scrolls and modules size to their content instead; the high-fidelity slot skeletons
   keep the streamed swap from moving the layout there. */

/**
 * The gap between the education items in the education module.  The 12px gap is left even for
 * max-md cases, because an 8px gap between the education items looks a little "squished".
 */
const EducationItemsGap = 'gap-[12px]';

/* Fixed module frames with internal scrolling exist only at 'xl' and above, where the grid fits the
   viewport exactly. Below 'xl' the page itself scrolls, so a module that scrolls internally would
   nest a scrollbar inside the scrolling page — and a module held to a fixed height either clips
   short content into a scroll or pads long tracks with dead space. In every page-scroll band the
   modules simply size to their content. */

/**
 * The class names every dashboard module carries so that, at 'xl' and above, its grid track —
 * never its content — determines its size: the module may shrink below its content's intrinsic
 * size (`min-h-0`, `min-w-0`), and anything that does not fit is clipped at the frame while the
 * module's content area scrolls. Below 'xl' the frame does not clip, because modules size to
 * their content there.
 */
const ModuleFrameClassNames = 'min-h-0 min-w-0 xl:overflow-hidden';

/**
 * The class names every dashboard module's content area carries: at 'xl' and above it scrolls
 * internally (module frames are track-sized there); below 'xl' it flows naturally within a
 * content-sized module.
 *
 * `[&>*]:shrink-0` is load-bearing: the content areas are height-constrained flex columns at
 * 'xl', and without it the tiles inside would be compressed (`flex-shrink: 1` by default) to fit
 * the frame — clipping each tile top and bottom — instead of overflowing into the scroll
 * container.
 *
 * `scrollbar-gutter: stable` reserves the scrollbar's width from the start on platforms with
 * classic (non-overlay) scrollbars, so content width does not change — re-wrapping every line —
 * at the moment streamed content makes the area scrollable.
 */
const ModuleScrollClassNames =
  'xl:overflow-y-auto min-h-0 pr-[16px] [&>*]:shrink-0 xl:[scrollbar-gutter:stable]';

interface ColumnProps extends ComponentProps {
  readonly children: ReactNode;
}

const Column = ({ children, ...props }: ColumnProps): JSX.Element => (
  <div
    {...props}
    className={classNames('grid gap-[12px] min-h-0 max-xl:grid-rows-none', props.className)}
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
          'grid gap-[12px]',
          'pb-[16px] max-md:pb-[12px] max-sm:pb-[8px]',
          /* At 'xl' and above the grid fills the (viewport-derived) content area exactly: three
             fixed fractional columns, one full-height row. The chart takes 1.5fr against 1fr per
             module column (~43% / ~28.5% / ~28.5%) — dominant, without scrunching the columns on
             wide viewports. */
          'xl:h-full xl:min-h-0 xl:grid-cols-[1.5fr_1fr_1fr]',
          /* Below 'xl' the page scrolls and every module sizes to its content: the chart spans
             the full width, with the two module columns beneath it (side by side down to 'md',
             stacked below). */
          'md:max-xl:grid-cols-2',
          'max-md:grid-cols-1',
        )}
      >
        <Module className={classNames(ModuleFrameClassNames, 'md:max-xl:col-span-2')}>
          {chart}
        </Module>
        <Column className='xl:grid-rows-[3fr_2fr]'>
          <Module
            className={classNames(ModuleFrameClassNames)}
            data-attr-tour-id='recent-experience'
          >
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
                ModuleScrollClassNames,
              )}
            >
              {experiences}
            </Module.Content>
          </Module>
          <Module className={classNames(ModuleFrameClassNames)}>
            <Module.Header>Projects</Module.Header>
            <Module.Content
              className={classNames(
                'flex flex-col gap-[12px] max-md:gap-[8px]',
                ModuleScrollClassNames,
              )}
            >
              {projects}
            </Module.Content>
          </Module>
        </Column>
        {/* The education row is content-fitted (capped at half the column) rather than a fixed
            fraction: its content is short and stable, and a fixed track left dead space beneath
            the last education while the repositories module below was forced into scroll. The
            repositories row absorbs whatever the education row does not use. This is the one
            deliberate exception to the fixed-track rule — the education slot's skeleton renders
            the same tile count as the real data, so the streamed swap barely moves the shared
            row edge. */}
        <Column className='xl:grid-rows-[fit-content(50%)_minmax(0,1fr)]'>
          <Module className={classNames(ModuleFrameClassNames)}>
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
              className={classNames('flex flex-col', EducationItemsGap, ModuleScrollClassNames)}
            >
              {educations}
            </Module.Content>
          </Module>
          <Module className={classNames(ModuleFrameClassNames)}>
            <Module.Header>Repositories</Module.Header>
            <Module.Content
              className={classNames('flex flex-col max-md:gap-[8px]', ModuleScrollClassNames)}
            >
              {repositories}
            </Module.Content>
          </Module>
        </Column>
      </div>
    </Content>
  </>
);

export default DashboardPage;
