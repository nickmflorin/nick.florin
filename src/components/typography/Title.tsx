import clsx from "clsx";

import { ensuresDefinedValue } from "~/lib/typeguards";
import { type ComponentProps, type Style } from "~/components/types";
import { type FontWeight } from "~/components/typography";

type TitleOrder = 1 | 2 | 3 | 4 | 5 | 6;

type Factories = {
  [key in TitleOrder]: (props: {
    readonly children: string | number | undefined | null | false;
    readonly className?: string;
    readonly style?: Style;
  }) => JSX.Element;
};

const factories: Factories = {
  1: props => <h1 {...props} />,
  2: props => <h2 {...props} />,
  3: props => <h3 {...props} />,
  4: props => <h4 {...props} />,
  5: props => <h5 {...props} />,
  6: props => <h6 {...props} />,
};

export interface TitleProps extends ComponentProps {
  readonly children: string | number | undefined | null | false;
  readonly order?: TitleOrder;
  // Let the weight default in SASS baed on the size.
  readonly fontWeight?: FontWeight;
}

export const Title = ({ order = 3, fontWeight, children, ...props }: TitleProps): JSX.Element =>
  ensuresDefinedValue(factories[order])({
    ...props,
    children,
    className: clsx("title", fontWeight && `font-weight-${fontWeight}`),
  });
