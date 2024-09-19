import { InlineLink } from "~/components/buttons";
import { Description } from "~/components/typography";
import {
  Project as ProjectComponent,
  type ProjectProps,
} from "~/features/projects/components/Project";
import { ProjectImage } from "~/features/projects/components/ProjectImage";

import { BarChart } from "./BarChart";
import { BubbleChart } from "./BubbleChart";

export interface AssetVisualizationsProps
  extends Omit<ProjectProps, "title" | "description" | "children"> {}

export const AssetVisualizations = (props: AssetVisualizationsProps): JSX.Element => (
  <ProjectComponent
    title="n-Dimensional Charting Library for Asset Management"
    description={
      <Description>
        A JavaScript charting library written in&nbsp;
        <InlineLink element="a" href="https://d3js.org">
          d3.js
        </InlineLink>
        &nbsp;that can be used to visualize data in either 4 or 5 dimensions (depending on the chart
        type), including time.
      </Description>
    }
    {...props}
  >
    <Description key="0">The package supported the following chart types:</Description>
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
        "Individual data points can be dynamically hidden and shown, allowing the user to " +
          "focus on certain data points of interest over time.",
      ]}
    />
  </ProjectComponent>
);

export default AssetVisualizations;
