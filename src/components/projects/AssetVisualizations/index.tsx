import { Link } from "~/components/buttons";
import { Text } from "~/components/typography/Text";

import { Project, type ProjectProps } from "../Project";
import { ProjectImage } from "../ProjectImage";

import { BarChart } from "./BarChart";
import { BubbleChart } from "./BubbleChart";

export interface AssetVisualizationsProps
  extends Omit<ProjectProps, "title" | "description" | "children"> {}

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
    ]}
    {...props}
  >
    <BubbleChart />
    <BarChart />
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
