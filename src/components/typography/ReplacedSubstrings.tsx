import parse from "html-react-parser";
import { ElementType } from "htmlparser2";

import { Text, type TextProps } from "./Text";

export interface ReplacedSubstringsProps extends Omit<TextProps<"span">, "children" | "component"> {
  readonly substring: string;
  readonly children: string;
}

export const ReplacedSubstrings = ({
  substring,
  children,
  ...props
}: ReplacedSubstringsProps): JSX.Element => {
  if (
    children.length === 0 ||
    substring.length === 0 ||
    !children.toLowerCase().includes(substring.toLowerCase())
  ) {
    return <>{children}</>;
  }
  const regex = new RegExp(substring, "gi");
  const html = children.replace(regex, "<span>$&</span>");
  return (
    <>
      {parse(html, {
        replace: domNode => {
          if (domNode.type === ElementType.Tag && domNode.tagName === "span") {
            const child = domNode.children[0];
            if (child.type === ElementType.Text) {
              return (
                <Text component="span" {...props}>
                  {child.data}
                </Text>
              );
            }
          }
          return domNode;
        },
      })}
    </>
  );
};
