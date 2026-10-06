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
 * Opens one result card on a LinkedIn search page and reads what the detail-stage triage needs.
 *
 * Search results expose no job identifier until a card is opened, so the card is found by its
 * title and company and clicked — the one action these scripts take, and one page view. It waits
 * for the details pane to show the posting, then returns the job identifier, the posting's header,
 * the external "Apply" link or Easy Apply, and the lines that mention compensation, company size,
 * sponsorship or an office arrangement, for the agent to read in context.
 */
const OpenCardScriptTemplate = `async () => {
  const want = __WANT__;
  const labelOf = (el) => el.getAttribute('aria-label') || el.innerText || '';
  const cardOf = (b) =>
    (b.parentElement ? b.parentElement.closest('li, button, [role="button"]') : null);
  const dismiss = [...document.querySelectorAll('main button, main [role="button"]')].find(
    (b) =>
      labelOf(b).trim().startsWith('Dismiss ' + want.title) &&
      ((cardOf(b) || {}).innerText || '').includes(want.company),
  );
  if (!dismiss) return { found: false, url: window.location.href };
  cardOf(dismiss).click();
  const paneOf = () => {
    const heading = [...document.querySelectorAll('h2')]
      .find((el) => el.innerText.trim() === 'About the job');
    let pane = heading ? heading.parentElement : null;
    for (let depth = 0; pane && depth < 12; depth += 1) {
      const complete = /About the company/.test(pane.innerText);
      if (complete && pane.querySelector('a[href*="/jobs/view/"]')) break;
      pane = pane.parentElement;
    }
    return pane;
  };
  let pane = null;
  for (let attempt = 0; attempt < 40 && !pane; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const candidate = paneOf();
    if (candidate && candidate.innerText.slice(0, 400).includes(want.company)) pane = candidate;
  }
  if (!pane) return { found: true, loaded: false, url: window.location.href };
  const facts = pane.innerText
    .split('\\n')
    .map((line) => line.trim())
    .filter((line) => /employees|\\$\\s?\\d|USD|salary|compensation|sponsor|visa/i.test(line)
      || /hybrid|on-?site|in-office|office|relocate|relocation/i.test(line))
    .slice(0, 20)
    .map((line) => line.slice(0, 220));
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
    facts,
    found: true,
    header: pane.innerText.slice(0, 300),
    id: idMatch ? idMatch[1] : null,
    loaded: true,
    url: href,
  };
}`;

/**
 * Builds the {@link OpenCardScriptTemplate} script for one result card. The title and company are
 * embedded as JSON, which is a valid JavaScript expression for any string they hold.
 *
 * @param {{ readonly company: string; readonly title: string }} want
 *   The company and title of the card to open, as the result-card reader returned them.
 *
 * @returns {string} The script, for the browser server's `evaluate_script` tool.
 */
export const openCardScript = (want: {
  readonly company: string;
  readonly title: string;
}): string =>
  OpenCardScriptTemplate.replace(
    '__WANT__',
    JSON.stringify({ company: want.company.trim(), title: want.title.trim() }),
  );

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
