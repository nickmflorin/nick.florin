import { Project, type ProjectProps } from "./Project";
import { ProjectImage } from "./ProjectImage";

export interface AssetVisualizationsProps
  extends Omit<ProjectProps, "title" | "description" | "children"> {}

export const AssetVisualizations = (props: AssetVisualizationsProps): JSX.Element => (
  <Project
    title="n-Dimensional Charting Library for Asset Management"
    description={[
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt " +
        "ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation " +
        "ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt " +
        "ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation " +
        "ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    ]}
    {...props}
  >
    <ProjectImage
      src="/projects/asset-visualizations/bubble-chart.png"
      alt="Bubble Chart"
      caption={[
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
          "ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation " +
          "ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
          "ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation " +
          "ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      ]}
    />
    <ProjectImage
      src="/projects/asset-visualizations/bar-chart.png"
      alt="Bubble Chart"
      caption={[
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
          "ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation " +
          "ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
          "ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation " +
          "ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      ]}
    />
    <ProjectImage
      src="/projects/asset-visualizations/changing-parameters.png"
      alt="Bubble Chart"
      caption={[
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
          "ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation " +
          "ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
          "ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation " +
          "ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      ]}
    />
    <ProjectImage
      src="/projects/asset-visualizations/hiding-showing.png"
      alt="Bubble Chart"
      caption={[
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
          "ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation " +
          "ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
          "ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation " +
          "ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      ]}
    />
  </Project>
);

export default AssetVisualizations;
