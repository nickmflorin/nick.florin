import { type JSX } from 'react';

import { InlineLink } from '~/components/buttons';
import { Description } from '~/components/typography';
import {
  Project as ProjectComponent,
  type ProjectProps,
} from '~/features/projects/components/Project';
import { ProjectImage } from '~/features/projects/components/ProjectImage';

import { BarChart } from './BarChart';
import { BubbleChart } from './BubbleChart';

export interface AssetVisualizationsProps extends Omit<
  ProjectProps,
  'children' | 'description' | 'title'
> {}

export const AssetVisualizations = (props: AssetVisualizationsProps): JSX.Element => (
  <ProjectComponent
    description={
      <Description>
        A JavaScript charting library written in{' '}
        <InlineLink element='a' href='https://d3js.org'>
          d3.js
        </InlineLink>{' '}
        that visualizes data in four or five dimensions, depending on the chart type, one of which
        can be time.
      </Description>
    }
    title='n-Dimensional Charting Library for Asset Management'
    {...props}
  >
    <Description key='0'>The package supports the following chart types:</Description>
    <BubbleChart />
    <BarChart />
    <ProjectImage
      alt='Changing Chart Parameters'
      caption={[
        'For every chart type, the metric that each dimension represents can be changed with a ' +
          'dropdown menu embedded in the canvas view. How this behaves is fully configurable ' +
          'when the chart instance is created.',
      ]}
      src='/projects/asset-visualizations/changing-parameters.png'
    />
    <ProjectImage
      alt='Hiding and Showing Data Points'
      caption={[
        'Individual data points can be hidden and shown on the fly, letting the user focus on ' +
          'the data points they care about over time.',
      ]}
      src='/projects/asset-visualizations/hiding-showing.png'
    />
  </ProjectComponent>
);
