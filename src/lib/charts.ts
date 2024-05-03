import resolveConfig from "tailwindcss/resolveConfig";

import { hexToRgb } from "~/lib/colors";
import { isRecordType } from "~/lib/typeguards";
import tailwindConfig from "~/tailwind.config";

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
  let index = 0;
  let colorIndex = 0;
  let shadeIndex = 0;

  const colors: Color[] = [];
  while (index < count) {
    if (colorIndex === CHART_COLORS.length) {
      colorIndex = 0;
      shadeIndex = Math.min(CHART_COLOR_SHADES.length, shadeIndex + 1);
    }
    if (shadeIndex === CHART_COLOR_SHADES.length) {
      shadeIndex = 0;
    }

    const s = CHART_COLOR_SHADES[shadeIndex];
    const c = CHART_COLORS[colorIndex];

    const tailwindShades = resolvedConfig.theme.colors[c];
    if (!isRecordType(tailwindShades)) {
      throw new Error(
        `The color '${c}' does not correspond to a record of shades in the Tailwind config!`,
      );
    }
    const tailwindHex = tailwindShades[s];
    if (typeof tailwindHex !== "string" || tailwindHex[0] !== "#") {
      throw new Error(
        `The shade '${s}' of color '${c}' does not correspond to a hex value in the Tailwind config!`,
      );
    }
    colors.push(hexToRgb(tailwindHex as `#${string}`, { alpha }));
    index += 1;
    colorIndex += 1;
  }
  return colors;
};
