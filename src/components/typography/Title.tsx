import { classNames } from "~/components/types";
import { type Style, type ComponentProps } from "~/components/types";
import {
  type TypographyCharacteristics,
  getTypographyClassName,
  type TitleFontSize,
  TitleFontSizeOrderMap,
  type TitleOrder,
} from "~/components/types/typography";

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

export interface TitleProps extends TypographyCharacteristics<TitleFontSize>, ComponentProps {
  readonly children: string | number | undefined | null | false;
  readonly order?: TitleOrder;
}

export const Title = ({
  order,
  children,
  className,
  fontSize,
  style,
  ...props
}: TitleProps): JSX.Element => {
  const o =
    order !== undefined ? order : fontSize !== undefined ? TitleFontSizeOrderMap[fontSize] : 3;
  const f = factories[o];
  return f({
    style,
    children,
    className: classNames("title", getTypographyClassName({ ...props, fontSize }), className),
  });
};
