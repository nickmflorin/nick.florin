import { z } from 'zod';

import {
  type ApplicationSystem,
  type Candidate,
  CompanySizeBands,
  LinkedInJobIdPattern,
} from '../schemas';

import { classifyApplyUrl } from './apply-systems';
import { companySizeBandOf, declinesSponsorship, linesOf, parseCompensation } from './cards';

/**
 * What the `open-card` page script returns: whether the card was found and its posting loaded, and,
 * once loaded, the posting's job identifier. The fields a missing or unloaded card lacks default.
 */
export const OpenedCardSchema = z.object({
  found: z.boolean(),
  id: z.string().regex(LinkedInJobIdPattern).nullable().default(null),
  loaded: z.boolean().default(false),
  url: z.string(),
});

export type OpenedCard = z.infer<typeof OpenedCardSchema>;

/**
 * What the `job-detail` page script returns for the posting open in the page.
 */
export const JobDetailSchema = z.object({
  applyUrl: z.string().url().nullable(),
  /**
   * Whether the page says the posting is no longer accepting applications.
   */
  closed: z.boolean().default(false),
  easyApply: z.boolean(),
  id: z.string().regex(LinkedInJobIdPattern).nullable(),
  text: z.string(),
  url: z.string(),
});

export type JobDetail = z.infer<typeof JobDetailSchema>;

const applySystemOf = ({ applyUrl, easyApply }: JobDetail): ApplicationSystem => {
  if (easyApply) {
    return 'easy-apply';
  }
  return applyUrl === null ? 'unresolved' : classifyApplyUrl(applyUrl);
};

/**
 * Rebuilds a pooled candidate at the detail stage from the posting that was opened for it: the
 * job identifier, the external apply link and the application system it identifies, and every fact
 * the posting states that the result card did not.
 *
 * The pay is read from a stated yearly range, the company size from `N-M employees`, and
 * `sponsorshipOffered` is `false` only when the text says no sponsorship is offered. A fact the
 * posting does not state keeps what the card published.
 *
 * @param {Candidate} pooled The card-stage candidate the posting was opened for.
 * @param {JobDetail} detail The opened posting, as the `job-detail` page script read it.
 * @param {string} id The posting's job identifier, already verified against the page.
 *
 * @returns {Candidate} The candidate, ready for the detail-stage triage.
 */
export const detailCandidate = (pooled: Candidate, detail: JobDetail, id: string): Candidate => {
  const lines = linesOf(detail.text);
  const band = companySizeBandOf(lines);
  return {
    ...pooled,
    applyUrl: detail.applyUrl,
    applyVia: applySystemOf(detail),
    companySize: CompanySizeBands.find(known => known === band) ?? pooled.companySize,
    compensation: lines.map(parseCompensation).find(range => range !== null) ?? pooled.compensation,
    id,
    sponsorshipOffered: declinesSponsorship(lines) ? false : pooled.sponsorshipOffered,
  };
};
