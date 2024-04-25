import clsx from "clsx";

import { ensuresDefinedValue } from "~/lib/typeguards";
import { type Style, type ComponentProps } from "~/components/types";

import { type BaseTypographyProps, getTypographyClassName } from "./types";

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

export interface TitleProps extends Omit<BaseTypographyProps, "fontSize">, ComponentProps {
  readonly children: string | number | undefined | null | false;
  readonly order?: TitleOrder;
}

export const Title = ({ order = 3, children, ...props }: TitleProps): JSX.Element =>
  ensuresDefinedValue(factories[order])({
    ...props,
    children,
    className: clsx("title", getTypographyClassName(props), props.className),
  });
