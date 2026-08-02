import { type CSSProperties } from 'react';

import { type ClassName } from './classes';

export type Style = CSSProperties;

export type ComponentProps = {
  readonly className?: ClassName;
  readonly style?: Style;
};
