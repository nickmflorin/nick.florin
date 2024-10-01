import resolveConfig from "tailwindcss/resolveConfig";

import TailwindConfig from "../../tailwind.config";

const _Theme = resolveConfig(TailwindConfig);

export type ApplicationTheme = Omit<typeof _Theme, "theme"> & {
  readonly theme: (typeof _Theme)["theme"] & typeof TailwindConfig.theme.extend;
};

export const Theme = _Theme as ApplicationTheme;
