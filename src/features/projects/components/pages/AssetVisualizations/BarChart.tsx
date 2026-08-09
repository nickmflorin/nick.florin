import { Description } from '~/components/typography';
import { ProjectImage } from '~/features/projects/components/ProjectImage';
import { Section } from '~/features/projects/components/Section';
import { Series } from '~/features/projects/components/Series';
import { SeriesItem } from '~/features/projects/components/SeriesItem';

export const BarChart = () => (
  <Section
    description={
      <Description>
        A Bar Chart can visualize data in three dimensions at once (excluding time), each
        represented by one of the following characteristics of the chart:
      </Description>
    }
    title='Bar Chart'
  >
    <Series>
      <SeriesItem title='X-Axis'>
        The x-axis can be configured with a dropdown menu to represent the desired metric. When a
        bar in the chart is hovered, a dotted line indicates exactly where that data point sits on
        the x-axis.
      </SeriesItem>
      <SeriesItem title='Y-Axis'>
        The y-axis can be configured with a dropdown menu to represent the desired metric. When a
        bar in the chart is hovered, a dotted line indicates exactly where that data point sits on
        the y-axis.
      </SeriesItem>
      <SeriesItem title='Color'>
        The color of the bar itself can represent a dimension of the data. For discrete, string
        values, color can group bars that share the same value. For continuous, numeric values,
        shades of a color can represent the magnitude of the value.
      </SeriesItem>
      <SeriesItem title='Time'>
        If the data is provided as a time series, the chart includes a play button that animates the
        dimensions of the chart changing over time.
      </SeriesItem>
    </Series>
    <ProjectImage
      alt='Bar Chart'
      caption={[
        'In this example, the color dimension identifies each distinct data point. The exact x ' +
          'and y coordinates of a bar are shown when it is hovered.',
        'Clicking a bar pins a draggable tag to the chart view, which can be hidden by clicking ' +
          'the bar a second time.',
      ]}
      src='/projects/asset-visualizations/bar-chart.png'
    />
  </Section>
);
