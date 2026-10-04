/**
 * Reads the result cards of a LinkedIn jobs page — a search or the recommendations — without
 * navigating, clicking or fetching anything.
 *
 * Each card is found through its "Dismiss {title} job" button, whose accessible name is part of
 * LinkedIn's accessibility contract and survives the obfuscated, frequently changing class names
 * that a selector-based reader would depend on. For each card it returns the title, the card's text
 * lines, and the job identifier when the card links to the posting (the recommendations page does;
 * search results do not until a card is opened). It also returns the filters the page reports as
 * applied, so a run can confirm what LinkedIn actually filtered by, and the page URL, which reveals
 * a redirect to a sign-in or security-challenge page.
 */
const ResultCardsScript = `() => {
  const titleFrom = (label) => {
    const match = /^Dismiss (.+) job$/.exec((label || '').trim());
    return match ? match[1] : null;
  };
  const labelOf = (el) => el.getAttribute('aria-label') || el.innerText || '';
  const cards = [...document.querySelectorAll('main button, main [role="button"]')]
    .filter((button) => titleFrom(labelOf(button)) !== null)
    .map((button) => {
      const title = titleFrom(labelOf(button));
      const parent = button.parentElement;
      const card = parent ? parent.closest('li, button, [role="button"]') : null;
      const lines = (card ? card.innerText : '')
        .split('\\n')
        .map((line) => line.trim())
        .filter((line) => line !== '' && !line.startsWith('Dismiss '));
      const link = card ? card.querySelector('a[href*="/jobs/view/"]') : null;
      const idMatch = link ? /\\/jobs\\/view\\/(\\d+)/.exec(link.getAttribute('href')) : null;
      return { id: idMatch ? idMatch[1] : null, lines, title };
    });
  const filters = [
    ...document.querySelectorAll('[role="checkbox"][aria-checked="true"], input:checked'),
  ]
    .map((el) => (el.getAttribute('aria-label') || (el.parentElement || el).innerText || '').trim())
    .filter((text) => text !== '');
  const place = [...document.querySelectorAll('main button')]
    .map((el) => labelOf(el).trim())
    .find((label) => label.startsWith('Location'));
  return {
    cards,
    filters: [...new Set(filters)],
    location: place || null,
    url: window.location.href,
  };
}`;

/**
 * Reads the opened posting on a LinkedIn jobs page — the details pane of a search or the posting's
 * own page — without navigating, clicking or fetching anything.
 *
 * It returns the job identifier from the page URL, the pane's text from the posting's header
 * through "About the company" (title, location, posting age, workplace, compensation, description,
 * company size), whether the posting takes an Easy Apply application, the external "Apply" link
 * otherwise, and the page URL.
 */
const JobDetailScript = `() => {
  const heading = [...document.querySelectorAll('h2')]
    .find((el) => el.innerText.trim() === 'About the job');
  let pane = heading ? heading.parentElement : null;
  for (let depth = 0; pane && depth < 12; depth += 1) {
    const complete = /About the company/.test(pane.innerText);
    if (complete && pane.querySelector('a[href*="/jobs/view/"]')) break;
    pane = pane.parentElement;
  }
  const href = window.location.href;
  const idMatch = /currentJobId=(\\d+)/.exec(href) || /\\/jobs\\/view\\/(\\d+)/.exec(href);
  const nameOf = (el) =>
    ((el.innerText || '') + ' ' + (el.getAttribute('aria-label') || '')).trim();
  const apply = [...document.querySelectorAll('main a, main button')]
    .find((el) => /^(Easy Apply|Apply)\\b/.test(nameOf(el)));
  const easyApply = apply ? /Easy Apply/.test(nameOf(apply)) : false;
  return {
    applyUrl: apply && apply.tagName === 'A' && !easyApply ? apply.href : null,
    easyApply,
    id: idMatch ? idMatch[1] : null,
    text: pane ? pane.innerText.slice(0, 15000) : '',
    url: href,
  };
}`;

/**
 * The read-only scripts the agent runs in LinkedIn's pages through the browser server's
 * `evaluate_script` tool, by name.
 */
export const PageScripts = {
  'job-detail': JobDetailScript,
  'result-cards': ResultCardsScript,
} as const;

export const PageScriptNames = [
  'job-detail',
  'result-cards',
] as const satisfies readonly (keyof typeof PageScripts)[];

export type PageScriptName = (typeof PageScriptNames)[number];
