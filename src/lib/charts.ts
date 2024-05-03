import resolveConfig from "tailwindcss/resolveConfig";

import tailwindConfig from "~/tailwind.config";

import { tupleCycle } from "./arrays";
import { hexToRgb } from "./colors";
import { isRecordType } from "./typeguards";

const resolvedConfig = resolveConfig(tailwindConfig);

const CHART_COLORS = [
  "blue",
  "gray",
  "green",
  "yellow",
  "orange",
  "red",
  "sky",
  "rose",
  "purple",
  "cyan",
  "emerald",
  "fuchsia",
  "indigo",
  "lime",
  "pink",
  "sky",
  "slate",
  "stone",
  "teal",
  "violet",
  "zinc",
] as const;

const CHART_COLOR_SHADES = ["500", "600", "700", "800"] as const;

type Color = string;

export const generateChartColors = (count: number, alpha = 0.6): Color[] => {
  const iterator = tupleCycle([...CHART_COLOR_SHADES], [...CHART_COLORS]);

  let colors: Color[] = [];
  while (colors.length < count) {
    const [shade, color] = iterator.next().value;

    const tailwindShades = resolvedConfig.theme.colors[color];
    if (!isRecordType(tailwindShades)) {
      throw new Error(
        `The color '${color}' does not correspond to a record of shades in the Tailwind config!`,
      );
    }
    const tailwindHex = tailwindShades[shade];
    if (typeof tailwindHex !== "string" || tailwindHex[0] !== "#") {
      throw new Error(
        `The shade '${shade}' of color '${color}' does not correspond to a hex value in the Tailwind config!`,
      );
    }
    colors = [...colors, hexToRgb(tailwindHex as `#${string}`, { alpha })];
  }
  return colors;
};
