import { Module } from '~/components/structural/Module';
import { SkillsBarChartSkeleton } from '~/features/skills/components/charts/SkillsBarChartSkeleton';

/* The slot's streaming fallback renders the same skeleton the chart view shows until the chart has
   mounted, so every pre-chart state of the module — streamed fallback, chunk load, pre-mount render
   — is pixel-identical and nothing appears, disappears, or moves while the dashboard loads. */
const LoadingPage = () => (
  <>
    <Module.Header className='!pr-[0px]'>Skills Overview</Module.Header>
    <Module.Content className='xl:overflow-y-auto min-h-0 pr-[16px]'>
      <SkillsBarChartSkeleton />
    </Module.Content>
  </>
);

export default LoadingPage;
