/**
 * The fixed, breakpoint-dependent height classes applied to the skills bar chart's container.
 *
 * Shared with the dashboard chart slot's loading placeholder so that the height reserved while
 * the slot loads always matches the rendered chart's height, and the chart module does not
 * resize when the chart arrives.
 */
export const SkillsBarChartHeightClassNames = [
  'max-md:h-[340px]',
  'md:max-lg:h-[500px]',
  'lg:h-[600px]',
] as const;
