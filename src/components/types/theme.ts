import resolveConfig from 'tailwindcss/resolveConfig';

import TailwindConfig from '../../tailwind.config';

const _Theme = resolveConfig(TailwindConfig);

export type ApplicationTheme = {
  readonly theme: (typeof _Theme)['theme'] & typeof TailwindConfig.theme.extend;
} & Omit<typeof _Theme, 'theme'>;

export const Theme = _Theme as ApplicationTheme;
