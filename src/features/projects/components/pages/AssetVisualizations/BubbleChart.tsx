import { Description } from "~/components/typography";
import { ProjectImage } from "~/features/projects/components/ProjectImage";
import { Section } from "~/features/projects/components/Section";
import { Series } from "~/features/projects/components/Series";
import { SeriesItem } from "~/features/projects/components/SeriesItem";

export const BubbleChart = () => (
  <Section
    title="Bubble Chart"
    description={
      <Description>
        In the case of a Bubble Chart, data can be simultaneously visualized in 4 different
        dimensions (excluding time), which are represented by the following characteristics of the
        chart:
      </Description>
    }
  >
    <Series>
      <SeriesItem title="X-Axis">
        The x-axis can be configured with a dropdown menu to represent the desired metric. When
        hovering over a bubble in the chart, a dotted line will indicate exactly where that data
        point sits on the x-axis.
      </SeriesItem>
      <SeriesItem title="Y-Axis">
        The y-axis can be configured with a dropdown menu to represent the desired metric. When
        hovering over a bubble in the chart, a dotted line will indicate exactly where that data
        point sits on the x-axis.
      </SeriesItem>
      <SeriesItem title="Color">
        The color of the bubble itself can be used to represent a dimension of the data. For
        discrete, string values, the color can be used to group bubbles together that share the same
        value. For continuous, numeric values, shades of the color can be used to represent the
        magnitude of the value.
      </SeriesItem>
      <SeriesItem title="Size">
        The size of the bubble itself can be used to represent a dimension of the data. For
        discrete, string values, the size can be used to group bubbles together that share the same
        value. For continuous, numeric values, the size of the bubble can be used to represent the
        magnitude of the value.
      </SeriesItem>
      <SeriesItem title="Time">
        If the data is provided as a time-series, the chart will include an animation play button
        that, when clicked, will animate the dimensions of the chart changing over time.
      </SeriesItem>
    </Series>
    <ProjectImage
      src="/projects/asset-visualizations/bubble-chart.png"
      alt="Bubble Chart"
      caption={[
        "In this example, the color dimension is used to represent each distinct data point. " +
          "The exact x and y coordinates of each bubble are shown when the bubble is hovered.",
        "Clicking on a bubble causes a draggable tag to appear in the chart view, which can be " +
          "hidden by clicking on the bubble a second time.",
      ]}
    />
  </Section>
);
