import { Description } from "~/components/typography";

import { ProjectImage } from "../ProjectImage";
import { Section } from "../Section";
import { Series } from "../Series";
import { SeriesItem } from "../SeriesItem";

export const BarChart = () => (
  <Section
    title="Bar Chart"
    description={
      <Description>
        In the case of a Bar Chart, data can be simultaneously visualized in 3 different dimensions
        (excluding time), which are represented by the following characteristics of the chart:
      </Description>
    }
  >
    <Series>
      <SeriesItem title="X-Axis">
        The x-axis can be configured with a dropdown menu to represent the desired metric. When
        hovering over a bar in the chart, a dotted line will indicate exactly where that data point
        sits on the x-axis.
      </SeriesItem>
      <SeriesItem title="Y-Axis">
        The y-axis can be configured with a dropdown menu to represent the desired metric. When
        hovering over a bar in the chart, a dotted line will indicate exactly where that data point
        sits on the x-axis.
      </SeriesItem>
      <SeriesItem title="Color">
        The color of the bar itself can be used to represent a dimension of the data. For discrete,
        string values, the color can be used to group bars together that share the same value. For
        continuous, numeric values, shades of the color can be used to represent the magnitude of
        the value.
      </SeriesItem>
      <SeriesItem title="Time">
        If the data is provided as a time-series, the chart will include an animation play button
        that, when clicked, will animate the dimensions of the chart changing over time.
      </SeriesItem>
    </Series>
    <ProjectImage
      src="/projects/asset-visualizations/bar-chart.png"
      alt="Bubble Chart"
      caption={[
        "In this example, the color dimension is used to represent each distinct data point. " +
          "The exact x and y coordinates of each bubble are shown when the bar is hovered.",
        "Clicking on a bar causes a draggable tag to appear in the chart view, which can be " +
          "hidden by clicking on the bar a second time.",
      ]}
    />
  </Section>
);
