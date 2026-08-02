import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';

import { classNames } from '~/components/types';

export const BorderRadii = enumeratedLiterals(
  ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'] as const,
  {},
);
export type BorderRadius = EnumeratedLiteralsMember<typeof BorderRadii>;

type RadiusClassNameRT<R extends BorderRadius | null | undefined> = R extends BorderRadius
  ? string
  : null;

export const radiusClassName = <R extends BorderRadius | null | undefined>(
  radius: null | R,
): RadiusClassNameRT<R> => {
  if (!radius) {
    return null as RadiusClassNameRT<R>;
  }
  return classNames({
    ['rounded-2xl']: radius === BorderRadii['2XL'],
    ['rounded-3xl']: radius === BorderRadii['3XL'],
    ['rounded-full']: radius === BorderRadii.FULL,
    ['rounded-lg']: radius === BorderRadii.LG,
    ['rounded-md']: radius === BorderRadii.MD,
    ['rounded-none']: radius === BorderRadii.NONE,
    ['rounded-sm']: radius === BorderRadii.SM,
    ['rounded-xl']: radius === BorderRadii.XL,
    ['rounded-xs']: radius === BorderRadii.XS,
  }) as RadiusClassNameRT<R>;
};
