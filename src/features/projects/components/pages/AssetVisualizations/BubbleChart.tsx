import { Description } from '~/components/typography';
import { ProjectImage } from '~/features/projects/components/ProjectImage';
import { Section } from '~/features/projects/components/Section';
import { Series } from '~/features/projects/components/Series';
import { SeriesItem } from '~/features/projects/components/SeriesItem';

export const BubbleChart = () => (
  <Section
    description={
      <Description>
        A Bubble Chart can visualize data in four dimensions at once (excluding time), each
        represented by one of the following characteristics of the chart:
      </Description>
    }
    title='Bubble Chart'
  >
    <Series>
      <SeriesItem title='X-Axis'>
        The x-axis can be configured with a dropdown menu to represent the desired metric. When a
        bubble in the chart is hovered, a dotted line indicates exactly where that data point sits
        on the x-axis.
      </SeriesItem>
      <SeriesItem title='Y-Axis'>
        The y-axis can be configured with a dropdown menu to represent the desired metric. When a
        bubble in the chart is hovered, a dotted line indicates exactly where that data point sits
        on the y-axis.
      </SeriesItem>
      <SeriesItem title='Color'>
        The color of the bubble itself can represent a dimension of the data. For discrete, string
        values, color can group bubbles that share the same value. For continuous, numeric values,
        shades of a color can represent the magnitude of the value.
      </SeriesItem>
      <SeriesItem title='Size'>
        The size of the bubble itself can also represent a dimension of the data. For discrete,
        string values, size can group bubbles that share the same value. For continuous, numeric
        values, the size of the bubble can represent the magnitude of the value.
      </SeriesItem>
      <SeriesItem title='Time'>
        If the data is provided as a time series, the chart includes a play button that animates the
        dimensions of the chart changing over time.
      </SeriesItem>
    </Series>
    <ProjectImage
      alt='Bubble Chart'
      caption={[
        'In this example, the color dimension identifies each distinct data point. The exact x ' +
          'and y coordinates of a bubble are shown when it is hovered.',
        'Clicking a bubble pins a draggable tag to the chart view, which can be hidden by ' +
          'clicking the bubble a second time.',
      ]}
      src='/projects/asset-visualizations/bubble-chart.png'
    />
  </Section>
);
