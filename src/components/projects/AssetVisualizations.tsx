import { Link } from "~/components/buttons";
import { type Size } from "~/components/types";
import { type TypographySize } from "~/components/typography";
import { Text } from "~/components/typography/Text";

import { Project, type ProjectProps } from "./Project";
import { ProjectImage } from "./ProjectImage";

export interface AssetVisualizationsProps
  extends Omit<ProjectProps, "title" | "description" | "children"> {}

interface SeriesItemProps {
  readonly gap?: Size;
  readonly title: string;
  readonly children: string;
  readonly withColon?: boolean;
  readonly titleWidth: Size;
  readonly textSize?: TypographySize;
}

const SeriesItem = ({
  gap = "6px",
  title,
  children,
  withColon = false,
  titleWidth,
  textSize = "md",
}: SeriesItemProps) => (
  <div className="flex flex-row items-start" style={{ gap }}>
    <Text
      fontWeight="medium"
      flex
      size={textSize}
      className="text-body"
      style={{ maxWidth: titleWidth, minWidth: titleWidth }}
    >
      {title}
      {withColon && (
        <Text size={textSize} span className="text-body-light">
          :
        </Text>
      )}
    </Text>
    <Text size={textSize} className="text-body-light">
      {children}
    </Text>
  </div>
);

const BubbleChart = () => (
  <div className="flex flex-col gap-[12px]">
    <div className="flex flex-col gap-[4px]">
      <Text fontWeight="medium" flex className="text-body">
        Bubble Chart
      </Text>
      <Text className="text-body-light">
        In the case of a Bubble Chart, data can be simultaneously visualized in 4 different
        dimensions (excluding time), which are represented by the following characteristics of the
        chart:
      </Text>
    </div>
    <div className="flex flex-col gap-[8px]">
      <SeriesItem textSize="sm" title="X-Axis" titleWidth="70px" withColon>
        The x-axis can be configured with a dropdown menu to represent the desired metric. When
        hovering over a bubble in the chart, a dotted line will indicate exactly where that data
        point sits on the x-axis.
      </SeriesItem>
      <SeriesItem textSize="sm" title="Y-Axis" titleWidth="70px" withColon>
        The y-axis can be configured with a dropdown menu to represent the desired metric. When
        hovering over a bubble in the chart, a dotted line will indicate exactly where that data
        point sits on the x-axis.
      </SeriesItem>
      <SeriesItem textSize="sm" title="Color" titleWidth="70px" withColon>
        The color of the bubble itself can be used to represent a dimension of the data. For
        discrete, string values, the color can be used to group bubbles together that share the same
        value. For continuous, numeric values, shades of the color can be used to represent the
        magnitude of the value.
      </SeriesItem>
      <SeriesItem textSize="sm" title="Size" titleWidth="70px" withColon>
        The size of the bubble itself can be used to represent a dimension of the data. For
        discrete, string values, the size can be used to group bubbles together that share the same
        value. For continuous, numeric values, the size of the bubble can be used to represent the
        magnitude of the value.
      </SeriesItem>
      <SeriesItem textSize="sm" title="Time" titleWidth="70px" withColon>
        If the data is provided as a time-series, the chart will include an animation play button
        that, when clicked, will animate the dimensions of the chart changing over time.
      </SeriesItem>
    </div>
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
  </div>
);

const BarChart = () => (
  <div className="flex flex-col gap-[12px]">
    <div className="flex flex-col gap-[4px]">
      <Text fontWeight="medium" flex className="text-body">
        Bar Chart
      </Text>
      <Text className="text-body-light">
        In the case of a Bar Chart, data can be simultaneously visualized in 3 different dimensions
        (excluding time), which are represented by the following characteristics of the chart:
      </Text>
    </div>
    <div className="flex flex-col gap-[8px]">
      <SeriesItem textSize="sm" title="X-Axis" titleWidth="70px" withColon>
        The x-axis can be configured with a dropdown menu to represent the desired metric. When
        hovering over a bar in the chart, a dotted line will indicate exactly where that data point
        sits on the x-axis.
      </SeriesItem>
      <SeriesItem textSize="sm" title="Y-Axis" titleWidth="70px" withColon>
        The y-axis can be configured with a dropdown menu to represent the desired metric. When
        hovering over a bar in the chart, a dotted line will indicate exactly where that data point
        sits on the x-axis.
      </SeriesItem>
      <SeriesItem textSize="sm" title="Color" titleWidth="70px" withColon>
        The color of the bar itself can be used to represent a dimension of the data. For discrete,
        string values, the color can be used to group bars together that share the same value. For
        continuous, numeric values, shades of the color can be used to represent the magnitude of
        the value.
      </SeriesItem>
      <SeriesItem textSize="sm" title="Time" titleWidth="70px" withColon>
        If the data is provided as a time-series, the chart will include an animation play button
        that, when clicked, will animate the dimensions of the chart changing over time.
      </SeriesItem>
    </div>
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
  </div>
);

export const AssetVisualizations = (props: AssetVisualizationsProps): JSX.Element => (
  <Project
    title="n-Dimensional Charting Library for Asset Management"
    description={[
      <Text key="0" className="text-body-light">
        <Text span>A JavaScript charting library written in </Text>
        <Link options={{ as: "a" }} href="https://d3js.org">
          d3.js
        </Link>{" "}
        <Text span>
          that can be used to visualize data in either 4 or 5 dimensions (depending on the chart
          type) - including time. The package supported the following chart types:
        </Text>
      </Text>,
      <div key="1" className="flex flex-col gap-[24px]">
        <BubbleChart />
        <BarChart />
      </div>,
    ]}
    {...props}
  >
    <ProjectImage
      src="/projects/asset-visualizations/changing-parameters.png"
      alt="Bubble Chart"
      caption={[
        "For all chart types, the metrics that each dimension represent can be changed using a " +
          "dropdown menu embedded in the canvas view.  The manner in which this is done is " +
          "completely configurable during instantiation of the JavaScript chart instance.",
      ]}
    />
    <ProjectImage
      src="/projects/asset-visualizations/hiding-showing.png"
      alt="Bubble Chart"
      caption={[
        "Individual data points can be dynamically hidden and shown, allowing the user to focus " +
          "on certain data points of interest over time.",
      ]}
    />
  </Project>
);

export default AssetVisualizations;
