import { type JSX } from 'react';

import parse, { Element as DomElement, Text as DomText } from 'html-react-parser';

import { Text, type TextProps } from './Text';

export interface ReplacedSubstringsProps extends Omit<TextProps<'span'>, 'children' | 'component'> {
  readonly children: string;
  readonly substring: string;
}

export const ReplacedSubstrings = ({
  children,
  substring,
  ...props
}: ReplacedSubstringsProps): JSX.Element => {
  if (
    children.length === 0 ||
    substring.length === 0 ||
    !children.toLowerCase().includes(substring.toLowerCase())
  ) {
    return <>{children}</>;
  }
  const regex = new RegExp(substring, 'gi');
  const html = children.replace(regex, '<span>$&</span>');
  return (
    <>
      {parse(html, {
        replace: domNode => {
          if (domNode instanceof DomElement && domNode.tagName === 'span') {
            const child = domNode.children[0];
            if (child instanceof DomText) {
              return (
                <Text component='span' {...props}>
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
