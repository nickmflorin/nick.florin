import { IconDimensions, IconDiscreteSizes, IconFits, type IconProps } from '~/components/icons';
import { type Style } from '~/components/types';

export const getNativeIconStyle = ({
  dimension = IconDimensions.HEIGHT,
  fit = IconFits.FIT,
  size,
}: Pick<IconProps, 'dimension' | 'fit' | 'size'>): Style => {
  if (size === undefined || IconDiscreteSizes.contains(size)) {
    // In this case, the sizing is handled by SASS via class names on the <i> element.
    return {};
  } else if (dimension === IconDimensions.HEIGHT) {
    return {
      aspectRatio: fit === IconFits.SQUARE ? 1 : undefined,
      height: size,
      maxWidth: size,
      width: 'auto',
    };
  }
  return {
    aspectRatio: fit === IconFits.SQUARE ? 1 : undefined,
    height: 'auto',
    maxHeight: size,
    width: size,
  };
};
