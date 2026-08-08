export const MobileNavigationCutoff = 450;

/**
 * The DOM ID of the header's primary-resume actions.
 *
 * The site tour steps onto this element directly, and the element is only rendered when a primary
 * resume exists — so the tour treats its absence as a reason not to start rather than as an error
 * in the header itself.
 */
export const SiteResumeActionsElementId = 'site-resume-actions';
