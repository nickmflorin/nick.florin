import { getIconDefinition } from '~/components/icons/registry';
import { type FontAwesomeIconProp, type IconName, type IconProps } from '~/components/icons/types';

import { NativeIcon, type NativeIconProps } from './NativeIcon';

export interface FontAwesomeIconProps
  extends NativeIconProps, Pick<IconProps, 'family' | 'iconStyle'> {
  readonly icon: FontAwesomeIconProp | IconName;
}

/**
 * Renders a registered Font Awesome icon as an inline `<svg>`, nested inside the `<i>` wrapper
 * that {@link NativeIcon} provides.
 *
 * The SVG is rendered from the bundled icon definition (see `~/components/icons/registry.ts`)
 * rather than being injected by the Font Awesome kit script. Rendering the SVG in React means it
 * is present in the server-rendered HTML (no icon pop-in and no hydration mismatch when the kit
 * script raced hydration), and it re-renders when the icon prop changes — which the kit's
 * injected SVGs never did.
 *
 * The `<i class="icon"><svg/></i>` structure is the same shape the kit's "nest" strategy
 * produced, so the existing icon SCSS applies unchanged.
 */
export const FontAwesomeIcon = ({
  family: _family,
  icon,
  iconStyle,
  ref,
  ...props
}: FontAwesomeIconProps) => {
  const { name, ...overrides } =
    typeof icon === 'string' ? { iconStyle, name: icon } : { iconStyle, ...icon };
  const definition = getIconDefinition({ iconStyle: overrides.iconStyle, name });
  const [width, height, , , svgPathData] = definition.icon;
  const paths = Array.isArray(svgPathData) ? svgPathData : [svgPathData];
  return (
    <NativeIcon {...props} ref={ref}>
      <svg
        aria-hidden='true'
        fill='currentColor'
        focusable='false'
        role='img'
        viewBox={`0 0 ${width} ${height}`}
        xmlns='http://www.w3.org/2000/svg'
      >
        {paths.map((d, i) => (
          <path d={d} key={i} />
        ))}
      </svg>
    </NativeIcon>
  );
};
