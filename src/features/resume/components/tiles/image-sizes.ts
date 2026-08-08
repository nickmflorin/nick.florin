import type * as types from '~/features/resume/types';

/**
 * The responsive height of a resume model tile's image, per model size.
 *
 * The image is square — `.avatar` declares `aspect-ratio: 1` — so a height alone determines the
 * box, and the sibling text column takes the remaining width from `min-w-0` rather than from a
 * `calc()` that has to know the image's pixel size.
 *
 * These express, as media queries, the per-breakpoint lookup the header previously performed in
 * JavaScript against a User-Agent-seeded viewport width. Doing it in CSS is what allows the seed —
 * and with it the `headers()` read that forces every `(site)` route to render per request — to be
 * removed.
 */
export const ResumeModelImageSizes: Record<types.ResumeModelSize, string> = {
  large: 'h-[42px] xs:h-[44px] sm:h-[48px] md:h-[72px]',
  medium: 'h-[42px] xs:h-[44px]',
  small: 'h-[42px]',
};

/**
 * The left padding that aligns a tile's children under the title rather than under the image, per
 * model size.
 *
 * Each value tracks the image width at the same breakpoint, plus the 8px gap and the border. The
 * container variant is preserved from the original: the indent only applies once the tile itself
 * is wide enough to place the children beside the image.
 */
export const ResumeModelChildrenIndents: Record<types.ResumeModelSize, string> = {
  large:
    '@sm/resume-model-tile:pl-[50px] @sm/resume-model-tile:xs:pl-[52px] ' +
    '@sm/resume-model-tile:sm:pl-[56px] @sm/resume-model-tile:md:pl-[80px]',
  medium: '@sm/resume-model-tile:pl-[50px] @sm/resume-model-tile:xs:pl-[52px]',
  small: '@sm/resume-model-tile:pl-[50px]',
};
