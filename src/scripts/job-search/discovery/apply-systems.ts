import { type ApplicationSystem } from '../schemas';

/**
 * The path of LinkedIn's outbound-link interstitial, which wraps every external "Apply" link and
 * carries the destination in its `url` parameter.
 */
const LinkedInRedirectPath = '/safety/go';

/**
 * The applicant tracking systems recognized by host, each matched when the host is the given domain
 * or one of its subdomains.
 */
const SystemDomains = [
  ['ashby', 'ashbyhq.com'],
  ['greenhouse', 'greenhouse.io'],
  ['lever', 'lever.co'],
  ['workday', 'myworkdayjobs.com'],
  ['workday', 'myworkdaysite.com'],
] as const satisfies readonly (readonly [ApplicationSystem, string])[];

/**
 * The query parameters that applicant tracking systems' embedded job boards add to posting links on
 * an employer's own domain, which identify the system where the host cannot.
 */
const EmbeddedBoardParameters = [
  ['ashby', 'ashby_jid'],
  ['greenhouse', 'gh_jid'],
] as const satisfies readonly (readonly [ApplicationSystem, string])[];

const parseUrl = (value: string): null | URL => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

/**
 * Resolves an external "Apply" link to its destination, unwrapping LinkedIn's outbound-link
 * interstitial when the link passes through it.
 *
 * @param {string} applyUrl The link as it appears on the posting.
 *
 * @returns {null | URL} The destination, or `null` when the link is not a valid URL.
 */
export const resolveApplyDestination = (applyUrl: string): null | URL => {
  const url = parseUrl(applyUrl);
  const wrapped =
    url !== null &&
    url.hostname.endsWith('linkedin.com') &&
    url.pathname.startsWith(LinkedInRedirectPath)
      ? url.searchParams.get('url')
      : null;
  return wrapped === null ? url : parseUrl(wrapped);
};

/**
 * Identifies the applicant tracking system an external "Apply" link leads to.
 *
 * A system is also recognized on an employer's own domain by the parameter its embedded job board
 * adds to every posting link, such as Greenhouse's `gh_jid` or Ashby's `ashby_jid`.
 *
 * @param {string} applyUrl The link as it appears on the posting.
 *
 * @returns {ApplicationSystem} The system, or `other` when it is not one the tooling recognizes.
 */
export const classifyApplyUrl = (applyUrl: string): ApplicationSystem => {
  const destination = resolveApplyDestination(applyUrl);
  if (destination === null) {
    return 'other';
  }
  const host = destination.hostname.toLowerCase();
  return (
    SystemDomains.find(([, domain]) => host === domain || host.endsWith(`.${domain}`))?.[0] ??
    EmbeddedBoardParameters.find(([, parameter]) => destination.searchParams.has(parameter))?.[0] ??
    'other'
  );
};

/**
 * Whether applying through each system means creating an account on it. Easy Apply and the
 * single-page boards take an application without one; Workday requires an account per employer;
 * anything else is unknown until its form is seen, and is treated as requiring one.
 */
export const AccountRequirements = {
  ashby: 'no',
  'easy-apply': 'no',
  greenhouse: 'no',
  lever: 'no',
  other: 'unknown',
  unresolved: 'unknown',
  workday: 'yes',
} as const satisfies Record<ApplicationSystem, 'no' | 'unknown' | 'yes'>;
