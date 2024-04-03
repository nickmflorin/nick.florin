import { type ApiProject } from "~/prisma/model";
import { Link } from "~/components/buttons";
import { Description } from "~/components/typography/Description";
import { Text } from "~/components/typography/Text";

import { Project as ProjectComponent, type ProjectProps } from "../Project";
import { ProjectImage } from "../ProjectImage";

import { BarChart } from "./BarChart";
import { BubbleChart } from "./BubbleChart";

export interface AssetVisualizationsProps
  extends Omit<ProjectProps, "title" | "description" | "children"> {
  readonly project: ApiProject<{ skills: true }>;
}

export const AssetVisualizations = (props: AssetVisualizationsProps): JSX.Element => (
  <ProjectComponent
    title="n-Dimensional Charting Library for Asset Management"
    description={
      <Description fontSize="smplus">
        A JavaScript charting library written in{" "}
        <Link options={{ as: "a" }} href="https://d3js.org">
          d3.js
        </Link>{" "}
        that can be used to visualize data in either 4 or 5 dimensions (depending on the chart
        type), including time.
      </Description>
    }
    {...props}
  >
    <Text key="0" className="text-body-light" size="smplus">
      The package supported the following chart types:
    </Text>
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
  </ProjectComponent>
);

export default AssetVisualizations;
