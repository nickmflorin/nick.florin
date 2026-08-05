import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faGithub, faLinkedin, faMedium, faNpm } from '@fortawesome/free-brands-svg-icons';
import {
  faAngleUp,
  faArrowDown19,
  faArrowLeft,
  faArrowUp,
  faArrowUp19,
  faBackpack,
  faBan,
  faBars,
  faBriefcase,
  faBuildingColumns,
  faCalendar,
  faChartKanban,
  faChartScatterBubble,
  faCheck,
  faChevronUp,
  faCircleExclamation,
  faCloudArrowDown,
  faCodeCommit,
  faDownload,
  faEllipsisH,
  faEye,
  faEyeSlash,
  faFilePdf,
  faGear,
  faGrid,
  faHammer,
  faHousePersonReturn,
  faImage,
  faInfoCircle,
  faLaptopCode,
  faLeaf,
  faLink,
  faListCheck,
  faLocationDot,
  faPalette,
  faPassport,
  faPenToSquare,
  faPipe,
  faSchool,
  faScrewdriverWrench,
  faSliders,
  faSquare,
  faStar,
  faTrashAlt,
  faXmark as faXmarkRegular,
} from '@fortawesome/pro-regular-svg-icons';
import {
  faCheck as faCheckSolid,
  faCircleCheck,
  faCircleXmark,
  faCodeCommit as faCodeCommitSolid,
  faEyeSlash as faEyeSlashSolid,
  faEye as faEyeSolid,
  faPlusCircle,
  faUpRightAndDownLeftFromCenter,
  faXmark,
} from '@fortawesome/pro-solid-svg-icons';

import { logger } from '~/internal/logger';

import { DEFAULT_ICON_STYLE, type IconStyle } from './types';

/* The registries below are the application's single source of truth for which Font Awesome icons
   are bundled, per style. The icon SVGs are compiled into the bundle from the (tree-shaken) icon
   packages rather than loaded by the Font Awesome kit script at runtime, so an icon must be
   registered here before it can be rendered — and the `IconName` type is derived from these keys so
   that an unregistered name is a compile error rather than a runtime miss. */

export const RegularIconRegistry = {
  'angle-up': faAngleUp,
  'arrow-down-1-9': faArrowDown19,
  'arrow-left': faArrowLeft,
  'arrow-up': faArrowUp,
  'arrow-up-1-9': faArrowUp19,
  backpack: faBackpack,
  ban: faBan,
  bars: faBars,
  briefcase: faBriefcase,
  'building-columns': faBuildingColumns,
  calendar: faCalendar,
  'chart-kanban': faChartKanban,
  'chart-scatter-bubble': faChartScatterBubble,
  check: faCheck,
  'chevron-up': faChevronUp,
  'circle-exclamation': faCircleExclamation,
  'cloud-arrow-down': faCloudArrowDown,
  'code-commit': faCodeCommit,
  download: faDownload,
  'ellipsis-h': faEllipsisH,
  eye: faEye,
  'eye-slash': faEyeSlash,
  'file-pdf': faFilePdf,
  gear: faGear,
  grid: faGrid,
  hammer: faHammer,
  'house-person-return': faHousePersonReturn,
  image: faImage,
  'info-circle': faInfoCircle,
  'laptop-code': faLaptopCode,
  leaf: faLeaf,
  link: faLink,
  'list-check': faListCheck,
  'location-dot': faLocationDot,
  palette: faPalette,
  passport: faPassport,
  'pen-to-square': faPenToSquare,
  pipe: faPipe,
  school: faSchool,
  'screwdriver-wrench': faScrewdriverWrench,
  sliders: faSliders,
  star: faStar,
  'trash-alt': faTrashAlt,
  xmark: faXmarkRegular,
} as const satisfies Record<string, IconDefinition>;

export const SolidIconRegistry = {
  check: faCheckSolid,
  'circle-check': faCircleCheck,
  'circle-xmark': faCircleXmark,
  'code-commit': faCodeCommitSolid,
  eye: faEyeSolid,
  'eye-slash': faEyeSlashSolid,
  'plus-circle': faPlusCircle,
  'up-right-and-down-left-from-center': faUpRightAndDownLeftFromCenter,
  xmark: faXmark,
} as const satisfies Record<string, IconDefinition>;

export const BrandsIconRegistry = {
  github: faGithub,
  linkedin: faLinkedin,
  medium: faMedium,
  npm: faNpm,
} as const satisfies Record<string, IconDefinition>;

export type RegularIconName = keyof typeof RegularIconRegistry;
export type SolidIconName = keyof typeof SolidIconRegistry;
export type BrandsIconName = keyof typeof BrandsIconRegistry;

export type RegisteredIconName = BrandsIconName | RegularIconName | SolidIconName;

export const IconRegistries = {
  brands: BrandsIconRegistry,
  regular: RegularIconRegistry,
  solid: SolidIconRegistry,
} as const satisfies Record<IconStyle, Record<string, IconDefinition>>;

/**
 * The order the registries are searched in when an icon is not registered for the style it was
 * requested with. The default style is checked first so that the most common variant is the one
 * substituted.
 */
const StyleResolutionOrder = ['regular', 'solid', 'brands'] as const satisfies readonly IconStyle[];

/**
 * The definition rendered when an icon name is not registered for any style: a bland placeholder
 * that keeps the surrounding UI intact while the log identifies the missing registration.
 */
const FallbackIconDefinition: IconDefinition = faSquare;

/**
 * Returns a style's registry widened to a string-keyed view, so a name can be probed against a
 * registry other than its own style's without the concrete registries' exact key types rejecting
 * the lookup.
 */
const registryFor = (style: IconStyle): Record<string, IconDefinition | undefined> =>
  IconRegistries[style];

/**
 * Returns the bundled {@link IconDefinition} registered for the provided icon name and style.
 *
 * Resolution is forgiving at runtime while the types stay strict: when the name is not registered
 * for the requested style but is registered for another, the other style's definition is
 * substituted; when the name is not registered at all, {@link FallbackIconDefinition} is
 * rendered. Both cases log an error identifying the registration that is missing — rendering a
 * slightly-wrong or bland icon is preferable to crashing the subtree, but the miss is still a
 * defect to fix.
 *
 * @param {{ iconStyle?: IconStyle; name: RegisteredIconName }} icon
 *   The name of the icon and, optionally, the style whose registry the name should be resolved
 *   against. The style defaults to the application-wide default style.
 *
 * @returns {IconDefinition} The bundled definition for the icon.
 */
export const getIconDefinition = ({
  iconStyle = DEFAULT_ICON_STYLE,
  name,
}: {
  readonly iconStyle?: IconStyle;
  readonly name: RegisteredIconName;
}): IconDefinition => {
  const definition = registryFor(iconStyle)[name];
  if (definition !== undefined) {
    return definition;
  }
  for (const style of StyleResolutionOrder) {
    if (style !== iconStyle) {
      const substitute = registryFor(style)[name];
      if (substitute !== undefined) {
        logger.error(
          `The icon '${name}' is not registered for the '${iconStyle}' style, but is registered ` +
            `for the '${style}' style - rendering the '${style}' variant. Either the icon should ` +
            "be added to the requested style's registry in ~/components/icons/registry.ts, or " +
            'the call site should request the registered style.',
          { iconStyle, name, substitutedStyle: style },
        );
        return substitute;
      }
    }
  }
  logger.error(
    `The icon '${name}' is not registered for any style! Rendering the fallback icon. It must ` +
      'be added to a registry in ~/components/icons/registry.ts to render correctly.',
    { iconStyle, name },
  );
  return FallbackIconDefinition;
};
