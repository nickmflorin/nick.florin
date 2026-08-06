import { preload } from 'swr';

import { apiClient } from '~/api';
import { type QueryParamObj } from '~/integrations/http';

/**
 * The SWR keys for the data-backed selects that the `SkillsChartFilterForm` renders
 * (`ClientEducationSelect` and `ClientExperienceSelect`).
 *
 * Each entry must match, by value, the `[path, query]` key that the corresponding hook
 * (`useEducations`, `useExperiences`) constructs from the props the form passes to its select —
 * SWR resolves a preloaded request against a mounted hook by comparing the serialized keys. If
 * the form's `includes`/`visibility` props change, these entries change with them.
 */
const SkillsChartFilterDataKeys: [string, QueryParamObj][] = [
  ['/api/educations', { includes: ['skills'], visibility: 'public' }],
  ['/api/experiences', { includes: [], visibility: 'public' }],
];

/* Mirrors the fetcher in `use-swr.ts`, minus the per-hook abort signal, so the preloaded request
   is processed identically to the one the mounted hook would make. */
const fetcher = ([path, query]: [string, QueryParamObj]) =>
  apiClient.get(path, query, { processed: true, strict: true });

/**
 * Starts the requests for the filter form's select data ahead of the form actually mounting, so
 * that by the time the filters popover (or drawer) opens, the selects' SWR hooks find the data
 * already cached or in flight rather than beginning their fetches on mount.
 *
 * Rejections are deliberately swallowed here: when the popover is subsequently opened, the
 * mounted hook consumes the same rejected promise and surfaces the error through its own error
 * handling; when it never opens, the failure is irrelevant and must not surface as an unhandled
 * rejection.
 */
let hasPreloaded = false;

export const preloadSkillsChartFilterData = (): void => {
  /* Fires once per page load. SWR's `preload` only deduplicates until a mounting hook consumes
     the preloaded entry, so an unguarded call would issue fresh requests on every hover after the
     popover has been opened once — the hooks' own revalidation semantics cover freshness from
     that point on. */
  if (hasPreloaded) {
    return;
  }
  hasPreloaded = true;
  for (const key of SkillsChartFilterDataKeys) {
    void preload(key, fetcher).catch(() => undefined);
  }
};
