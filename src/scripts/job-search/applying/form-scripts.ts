import { z } from 'zod';

import { FormFieldTypes } from './answers';

/**
 * The kinds of field the form reader reports: the kinds a question is answered through, and a file
 * input, which is filled by uploading rather than by answering.
 */
export const ReadFieldTypes = [...FormFieldTypes, 'file'] as const;

export type ReadFieldType = (typeof ReadFieldTypes)[number];

/**
 * How a field is operated. A `native` field is set by the fill script. A `combobox` opens a menu of
 * options and a `typeahead` suggests options for typed text; both answer only to trusted input, so
 * they are opened through the browser server and the option is then chosen by script. A `file` is
 * uploaded through the browser server.
 */
export const FormWidgets = ['combobox', 'file', 'native', 'typeahead'] as const;

export type FormWidget = (typeof FormWidgets)[number];

export const FieldValueSchema = z.union([z.string(), z.boolean(), z.array(z.string())]);

export type FieldValue = z.infer<typeof FieldValueSchema>;

export const ReadFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string(),
  options: z.array(z.string()).nullable(),
  required: z.boolean(),
  /**
   * The key that runs a typeahead's search once its text is typed, for a typeahead that suggests
   * nothing until it is pressed — Workday's search prompts.
   */
  submitKey: z.literal('Enter').optional(),
  type: z.enum(ReadFieldTypes),
  value: FieldValueSchema.nullable(),
  widget: z.enum(FormWidgets),
});

export type ReadField = z.infer<typeof ReadFieldSchema>;

/**
 * What the form reader returns: the fields of the form or Easy Apply step in view, with their
 * labels, options and current values; the controls it does not know how to fill; the step's
 * progress and buttons; whether a CAPTCHA challenge is showing; whether the page asks to sign in
 * instead — a lapsed LinkedIn session, an employer's board that wants an account, or a Workday
 * session that expired and fell back to its sign-in step; whether the page shows an error in
 * place of the form, as Workday's "Something went wrong" does; and the visible text, which on a
 * review step is the whole of what will be submitted.
 */
export const FormReadingSchema = z.object({
  /**
   * The document file names the form shows outside any list of choices — the resume a board shows
   * once it has taken an upload and removed its file input, as Greenhouse does.
   */
  attachments: z.array(z.string()).default([]),
  buttons: z.array(z.string()),
  challenge: z.boolean(),
  /**
   * The validation messages the form shows — "This field is required" beside a question — which
   * mean it refused the step, whatever the reading's fields say.
   */
  errors: z.array(z.string()).default([]),
  fields: z.array(ReadFieldSchema),
  pageError: z.boolean().default(false),
  progress: z.string().nullable(),
  signIn: z.boolean().default(false),
  text: z.string(),
  unsupported: z.array(z.string()),
  url: z.string(),
});

export type FormReading = z.infer<typeof FormReadingSchema>;

/**
 * A field the fill script sets, or that is chosen through the browser server, and the value it is
 * set to.
 */
export interface PlannedFill {
  readonly key: string;
  readonly label: string;
  readonly submitKey?: ReadField['submitKey'];
  readonly type: ReadFieldType;
  readonly value: FieldValue;
  readonly widget: FormWidget;
}

/**
 * The accessible name a revealed file input is given, by which a snapshot of the page finds it.
 */
export const RevealedFileInputName = 'job-search-upload';

/**
 * The helpers every form script shares, so that the reader and the filler agree on how a field is
 * found, and on the text of each option.
 */
const FormHelpers = String.raw`
  const KeyAttribute = 'data-job-search-key';
  const OptionsAttribute = 'data-job-search-options';
  const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();
  const stripMarker = (text) => clean(text).replace(/\s*\*\s*$/, '').trim();
  const visible = (el) => el.getClientRects().length > 0;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const labelFor = (el) =>
    el.id ? document.querySelector('label[for="' + CSS.escape(el.id) + '"]') : null;
  const optionText = (input) => {
    const own = labelFor(input) || input.closest('label');
    if (own && clean(own.innerText)) return clean(own.innerText);
    const roleRadio = input.closest('[role="radio"], [role="checkbox"]');
    if (roleRadio && clean(roleRadio.innerText)) return clean(roleRadio.innerText);
    let node = input.parentElement;
    for (let depth = 0; node && depth < 5; depth += 1) {
      const others = [...node.querySelectorAll('input[type="radio"], input[type="checkbox"]')]
        .filter((other) => other !== input);
      if (others.length > 0) break;
      if (clean(node.innerText)) return clean(node.innerText).slice(0, 160);
      node = node.parentElement;
    }
    return clean(input.value);
  };
  const openListbox = (input) => {
    const ids = [input.getAttribute('aria-controls'), input.getAttribute('aria-owns'),
      input.id ? 'react-select-' + input.id + '-listbox' : null].filter(Boolean);
    const owned = ids.map((id) => document.getElementById(id)).find((el) => el && visible(el));
    if (owned) return owned;
    const listboxes = [...document.querySelectorAll('[role="listbox"], [role="menu"]')]
      .filter((box) => visible(box) && !/selected/i.test(box.getAttribute('aria-label') || ''));
    const following = listboxes.filter(
      (box) => input.compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING,
    );
    return following[0] || listboxes[listboxes.length - 1] || null;
  };
  const popupButtonFor = (select) => {
    let node = select.parentElement;
    for (let depth = 0; node && depth < 3; depth += 1) {
      const button = node.querySelector('button[aria-haspopup]');
      if (button) return button;
      node = node.parentElement;
    }
    return null;
  };
  const pressButtons = (input) =>
    input.type === 'checkbox' && input.parentElement
      ? [...input.parentElement.querySelectorAll('button[aria-pressed]')]
      : [];
  const optionsIn = (listbox) => {
    const roleOptions = [...listbox.querySelectorAll('[role="option"], [role="menuitem"]')];
    return roleOptions.length > 0 ? roleOptions : [...listbox.querySelectorAll('button, li')];
  };
`;

/**
 * Reads the form in view — the open Easy Apply dialog, or the page's application form — without
 * changing any value.
 *
 * Each field is stamped with a `data-job-search-key` attribute — its `id`, or a radio group's
 * `name`, when it has one, which survive a re-render of the field; otherwise a number unique across
 * the page's lifetime — so that the fill script and a later reading address the same control. A
 * field's label is resolved through, in order, its `aria-label`, its `aria-labelledby`, its
 * `label[for]` (unless that only says "Attach" or "Upload"), its wrapping label, its fieldset's
 * legend, and finally the nearest label-like element before it that belongs to no other control,
 * which is how Ashby's radio questions and Greenhouse's file inputs are labelled. Failing all of
 * those, a lone field takes the first line of text in the nearest container that holds no other
 * control, as LinkedIn's location typeahead needs. A field is required when it is marked so, when
 * its label carries a `*`, a `required` class, or a `*` drawn by CSS, or when the first line of
 * the nearest container holding no other control ends in a `*`, which is how Easy Apply marks a
 * question whose radio buttons are labelled by the question itself.
 *
 * A file input labelled only by its drop zone — Workday's "Upload a file (5MB max)" — takes the
 * nearest heading before it, which names the document it asks for. Its value is the files it
 * holds or, once a board has taken them and emptied it as Workday does, the file names shown
 * beside it.
 *
 * A hidden select driven by a button that opens a menu — BambooHR's dropdowns — is reported as a
 * combobox, keyed on the button too, so that it is opened and chosen like any other; so is a
 * labelled button that opens a listbox on its own, as Workday's dropdowns are, labelled by a
 * `label[for]` or, for its questionnaire's questions, the legend of the fieldset around it.
 * Workday's search prompts (`data-uxi-widget-type="selectinput"`) are reported as typeaheads.
 *
 * Checkboxes whose ids differ only in a trailing number — Ashby's `…-labeled-checkbox-0` and `-1`,
 * a yes-or-no question asked through two checkboxes labelled "Yes" and "No" — are read as one
 * choice, labelled by the question.
 *
 * A checkbox that sits beside `aria-pressed` buttons — Ashby's yes-or-no questions — is reported as
 * a choice among the buttons, with the pressed one as its value, since the checkbox's own state
 * cannot tell an unanswered question from a "No".
 *
 * A combobox's options are known only once its menu has been opened, so a combobox not yet probed
 * by the {@link ProbeOperation} is reported with `options: null`. One with a short label
 * naming a place or a school is reported as a typeahead, whose options depend on what is typed.
 */
const ReadOperation = `
  const GenericLabel =
    new RegExp('^(attach|upload|upload file|choose file|file[- ]?input|browse|enter manually|' +
      'select\\\\.*|type here\\\\.*)$', 'i');
  const Typeahead =
    /\\b(location|city|address|school|university|college|degree|discipline|major)\\b/i;
  const GenericUpload = /^(upload|attach|select|choose|drop) (a |your )?files?( |$)/i;
  const headingBefore = (el) => {
    const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]')]
      .filter((heading) => visible(heading) &&
        heading.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
    const nearest = headings[headings.length - 1];
    return nearest ? stripMarker(nearest.innerText) : '';
  };
  const DocumentFile = /^[^\\/]+\\.(pdf|docx?|rtf|txt)$/i;
  const filesShownNear = (input) => {
    let node = input.parentElement;
    for (let depth = 0; node && depth < 5; depth += 1) {
      if (node.querySelectorAll('input[type="file"]').length > 1) break;
      const names = clean(node.innerText).split(' ').filter((word) => DocumentFile.test(word));
      if (names.length > 0) return names;
      node = node.parentElement;
    }
    return [];
  };
  const GroupContainer = 'fieldset, [role="radiogroup"], [role="group"]';
  const Numbered = /-\\d+$/;
  const sameSeries = (a, b) => Boolean(a.id) && Boolean(b.id) && Numbered.test(a.id) &&
    a.id.replace(Numbered, '') === b.id.replace(Numbered, '');
  const legendOf = (el) => {
    const fieldset = el.closest('fieldset');
    return fieldset ? fieldset.querySelector('legend') : null;
  };
  const controlCount = (el) =>
    el.querySelectorAll('input, select, textarea, [role="combobox"]').length;
  const largest = (elements) =>
    elements.sort((a, b) => controlCount(b) - controlCount(a)).find((el) => controlCount(el) > 0);
  const dialogs = [...document.querySelectorAll('dialog[open], [role="dialog"], [aria-modal="true"]')]
    .filter(visible);
  const root =
    largest(dialogs) || dialogs[0] || largest([...document.querySelectorAll('form')]) ||
    document.body;
  const classOf = (el) => (typeof el.className === 'string' ? el.className : '');
  const textOfIds = (ids) => clean((ids || '').split(/\\s+/).filter(Boolean)
    .map((id) => (document.getElementById(id) || {}).innerText || '').join(' '));
  const marked = (el) => !!el && (
    /\\*\\s*$/.test(clean(el.innerText)) || /required/i.test(classOf(el)) ||
    (getComputedStyle(el, '::after').content || '').includes('*'));
  const nearbyLabel = (el, group) => {
    let node = el.parentElement;
    let fallback = null;
    for (let depth = 0; node && depth < 7; depth += 1) {
      const foreign = [...node.querySelectorAll('input, select, textarea')]
        .filter((other) => !group.includes(other) && other.type !== 'hidden' &&
          other.getAttribute('aria-hidden') !== 'true');
      if (foreign.length > 0) break;
      const candidates = [...node.querySelectorAll(
        'label, legend, h3, h4, [role="heading"], [id$="-label"], [class*="label"], ' +
          '[class*="question"]',
      )]
        .filter((candidate) => !candidate.contains(el))
        .filter((candidate) => !candidate.querySelector('input, select, textarea'))
        .filter((candidate) => !(candidate.htmlFor && document.getElementById(candidate.htmlFor)))
        .filter((candidate) =>
          candidate.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)
        .filter((candidate) => {
          const text = stripMarker(candidate.innerText);
          return text !== '' && text.length < 400 && !GenericLabel.test(text);
        });
      const closest = candidates[candidates.length - 1];
      if (closest) return { el: closest, text: stripMarker(closest.innerText) };
      const firstLine = !fallback && group.length === 1 && el.tagName !== 'SELECT'
        ? (node.innerText || '').split('\\n').map(clean).find(Boolean)
        : undefined;
      if (firstLine && firstLine.length < 200 && !GenericLabel.test(stripMarker(firstLine))) {
        fallback = { el: null, starred: /\\*$/.test(firstLine), text: stripMarker(firstLine) };
      }
      node = node.parentElement;
    }
    return fallback;
  };
  const starredAbove = (el, group) => {
    let node = el.parentElement;
    for (let depth = 0; node && depth < 7; depth += 1) {
      const foreign = [...node.querySelectorAll('input, select, textarea')]
        .filter((other) => !group.includes(other) && other.type !== 'hidden' &&
          other.getAttribute('aria-hidden') !== 'true');
      if (foreign.length > 0) return false;
      const firstLine = (node.innerText || '').split('\\n').map(clean).find(Boolean);
      if (firstLine && /\\*$/.test(firstLine)) return true;
      node = node.parentElement;
    }
    return false;
  };
  const labelOf = (el, group) => {
    const container = group.length > 1 || el.tagName === 'BUTTON'
      ? el.closest(GroupContainer)
      : null;
    const legend = container ? container.querySelector('legend') : null;
    const roleRadio = el.closest('[role="radio"]');
    const own = group.length > 1 ? null : (labelFor(el) || el.closest('label'));
    const direct = [
      group.length > 1 || el.tagName === 'BUTTON'
        ? null
        : { el: null, text: el.getAttribute('aria-label') },
      { el: null, text: textOfIds(el.getAttribute('aria-labelledby')) },
      own && !GenericLabel.test(stripMarker(own.innerText))
        ? { el: own, text: own.innerText }
        : null,
      legend ? { el: legend, text: legend.innerText } : null,
      container ? { el: null, text: container.getAttribute('aria-label') } : null,
      roleRadio ? { el: null, text: roleRadio.getAttribute('aria-label') } : null,
    ].find((found) => found && stripMarker(found.text));
    const found = direct
      ? { el: direct.el, text: stripMarker(direct.text) }
      : nearbyLabel(el, group) || { el: null, text: '' };
    return {
      label: found.text.slice(0, 300),
      required: group.some((member) => member.required ||
        member.getAttribute('aria-required') === 'true') || marked(found.el) ||
        Boolean(found.starred) || (own ? marked(own) : false) || starredAbove(el, group),
    };
  };
  window.__jobSearchKeys = window.__jobSearchKeys || 0;
  const keyOf = (group) => {
    const stable = group.length > 1 && group[0].name
      ? 'name:' + group[0].name
      : group[0].id ? 'id:' + group[0].id : null;
    const existing = group.map((member) => member.getAttribute(KeyAttribute)).find(Boolean);
    const key = stable || existing || 'f' + window.__jobSearchKeys++;
    group.forEach((member) => member.setAttribute(KeyAttribute, key));
    return key;
  };
  const shown = (el) => {
    let node = el.parentElement;
    for (let depth = 0; node && depth < 4; depth += 1) {
      const single = node.querySelector(
        '[class*="single-value"], [class*="singleValue"], [data-automation-id="selectedItem"]',
      );
      if (single) return clean(single.innerText);
      node = node.parentElement;
    }
    return clean(el.value);
  };
  const controls = [...root.querySelectorAll('input, select, textarea')].filter((el) => {
    if (['hidden', 'submit', 'button', 'image', 'reset'].includes(el.type)) return false;
    if (/recaptcha/i.test(el.name + ' ' + el.id)) return false;
    if (el.tagName === 'SELECT' && popupButtonFor(el)) return true;
    if (el.getAttribute('aria-hidden') === 'true') return false;
    if (el.type === 'file' || el.type === 'radio' || el.type === 'checkbox') return true;
    if (el.tabIndex === -1 && !el.id) return false;
    return visible(el);
  });
  const popupFields = [...root.querySelectorAll('button[aria-haspopup="listbox"]')]
    .filter((button) => button.id && (labelFor(button) || legendOf(button)));
  const groups = [];
  [...controls, ...popupFields].forEach((el) => {
    if (el.type !== 'radio' && el.type !== 'checkbox') return groups.push([el]);
    const container = el.closest(GroupContainer);
    const existing = groups.find((group) => group[0].type === el.type && (
      (el.name && group[0].name === el.name) ||
      (container && el.type === 'radio' && group[0].closest(GroupContainer) === container) ||
      sameSeries(group[0], el)));
    return existing ? existing.push(el) : groups.push([el]);
  });
  const fields = groups.map((group) => {
    const el = group[0];
    const { label, required } = labelOf(el, group);
    const key = keyOf(group);
    const base = { key, label, required };
    if (el.tagName === 'BUTTON') {
      const probed = el.getAttribute(OptionsAttribute);
      const shownText = clean(el.innerText);
      return { ...base, options: probed ? JSON.parse(probed) : null, type: 'select',
        value: shownText && !/select/i.test(shownText) ? shownText : null, widget: 'combobox' };
    } else if (el.tagName === 'SELECT' && popupButtonFor(el)) {
      const button = popupButtonFor(el);
      button.setAttribute(KeyAttribute, key);
      const probed = button.getAttribute(OptionsAttribute);
      const shownText = clean(button.innerText);
      return { ...base, options: probed ? JSON.parse(probed) : null, type: 'select',
        value: shownText && !/select/i.test(shownText) ? shownText : null, widget: 'combobox' };
    } else if (el.tagName === 'SELECT') {
      const options = [...el.options].filter((option) =>
        option.value !== '' && !/^(select|choose)\\b/i.test(clean(option.text)));
      const selected = el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null;
      return { ...base, options: options.map((option) => clean(option.text)), type: 'select',
        value: selected && options.includes(selected) ? clean(selected.text) : null,
        widget: 'native' };
    } else if (el.tagName === 'TEXTAREA') {
      return { ...base, options: [], type: 'textarea', value: el.value || null, widget: 'native' };
    } else if (el.type === 'file') {
      return { ...base, label: (GenericUpload.test(label) && headingBefore(el)) || label,
        options: [], type: 'file',
        value: el.files && el.files.length > 0
          ? [...el.files].map((file) => file.name)
          : filesShownNear(el),
        widget: 'file' };
    } else if (pressButtons(el).length > 1) {
      const pressed = pressButtons(el).find((b) => b.getAttribute('aria-pressed') === 'true');
      return { ...base, options: pressButtons(el).map((b) => clean(b.innerText)), type: 'radio',
        value: pressed ? clean(pressed.innerText) : null, widget: 'native' };
    } else if (el.type === 'radio') {
      const checked = group.find((member) => member.checked);
      return { ...base, options: group.map(optionText), type: 'radio',
        value: checked ? optionText(checked) : null, widget: 'native' };
    } else if (el.type === 'checkbox') {
      return group.length > 1
        ? { ...base, options: group.map(optionText), type: 'checkbox',
            value: group.filter((member) => member.checked).map(optionText), widget: 'native' }
        : { ...base, label: label || optionText(el), options: [], type: 'checkbox',
            value: el.checked, widget: 'native' };
    } else if (el.getAttribute('role') === 'combobox' || el.getAttribute('aria-autocomplete') ||
      el.getAttribute('data-uxi-widget-type') === 'selectinput') {
      const probed = el.getAttribute(OptionsAttribute);
      const searched = el.getAttribute('data-uxi-widget-type') === 'selectinput';
      return searched || (Typeahead.test(label) && label.length <= 60)
        ? { ...base, options: [], submitKey: searched ? 'Enter' : undefined, type: 'text',
            value: shown(el) || null, widget: 'typeahead' }
        : { ...base, options: probed ? JSON.parse(probed) : null, type: 'select',
            value: shown(el) || null, widget: 'combobox' };
    }
    return { ...base, options: [],
      type: el.type === 'number' || el.type === 'date' ? el.type : 'text',
      value: el.value || null, widget: 'native' };
  });
  const unsupported = [...root.querySelectorAll('[role="switch"], [contenteditable="true"]')]
    .filter(visible)
    .map((el) => {
    const found = nearbyLabel(el, [el]);
    const name = el.innerText || el.getAttribute('aria-label');
    return clean((found ? found.text + ': ' : '') + name);
  });
  const progress = /(\\d+\\s*\\/\\s*\\d+\\s*pages?|\\d+\\s*%)/i.exec(root.innerText);
  const challengeFrames = document.querySelectorAll(
    'iframe[src*="recaptcha"][title*="challenge"], iframe[src*="hcaptcha"]',
  );
  const challenge =
    [...challengeFrames].some((frame) =>
      visible(frame) && frame.getBoundingClientRect().height > 100) ||
    /verify you are (a )?human|unusual activity|security check/i.test(document.body.innerText);
  const SignInPath = /\\/(?:login|signin|sign-in|authwall|checkpoint|uas\\/login)\\b/i;
  const SignInStep = /current step \\d+ of \\d+\\s+(create account\\s*\\/\\s*)?sign in/i;
  const signIn =
    SignInPath.test(window.location.pathname) ||
    [...document.querySelectorAll('input[type="password"]')].some(visible) ||
    SignInStep.test(document.body.innerText);
  const pageError = /something went wrong|please refresh the page/i.test(document.body.innerText);
  const inChoiceList = (el) => {
    let node = el.parentElement;
    for (let depth = 0; node && depth < 4; depth += 1) {
      if (node.querySelector('input[type="radio"], [role="radio"]')) return true;
      node = node.parentElement;
    }
    return false;
  };
  const attachments = [...new Set([...root.querySelectorAll('*')]
    .filter((el) => el.children.length === 0 && visible(el))
    .map((el) => [el, clean(el.textContent)])
    .filter(([el, text]) => DocumentFile.test(text) && !inChoiceList(el))
    .map(([, text]) => text))];
  const ValidationError = new RegExp('^(this (field|question) is required|this is a required ' +
    'field|required field|missing entry for required field.{0,200}|your form needs ' +
    'corrections|.{1,60} (is|are) required|(please )?(enter|select|provide|choose) a ' +
    'valid .{1,60}|please (answer|complete|fill (in|out)) this (field|question)|enter a (whole|' +
    'decimal) number .{0,60}|invalid .{1,60})[.!]?$', 'i');
  const errors = [...new Set([...root.querySelectorAll('*')]
    .filter((el) => el.children.length === 0 && visible(el))
    .map((el) => clean(el.textContent))
    .filter((text) => text.length < 140 && ValidationError.test(text)))];
  return {
    attachments,
    buttons: [...new Set([...root.querySelectorAll('button')]
      .map((button) => clean(button.innerText || button.getAttribute('aria-label')))
      .filter((text) => text !== '' && text.length <= 40))],
    challenge,
    errors,
    fields,
    pageError,
    progress: progress ? progress[1] : null,
    signIn,
    text: root.innerText.slice(0, 8000),
    unsupported,
    url: window.location.href,
  };
`;

/**
 * Reads the options of the combobox whose menu is open — opened by a click through the browser
 * server, since its menu answers only to trusted input — and records them on the combobox, so that
 * the next reading reports them. It closes the menu without choosing, and drops a placeholder such
 * as Workday's "Select One". The combobox is the read control that has focus, or, when opening the
 * menu moved focus into it, the read control that reports its menu expanded.
 */
const ProbeOperation = `
  const Placeholder = /^(select|choose)\\b/i;
  const focused = document.activeElement;
  const input = focused && focused.hasAttribute(KeyAttribute)
    ? focused
    : document.querySelector('[' + KeyAttribute + '][aria-expanded="true"]');
  if (!input) {
    return { error: 'No read combobox has focus. Read the form, then click the combobox.' };
  }
  let listbox = null;
  for (let attempt = 0; attempt < 10 && !listbox; attempt += 1) {
    await wait(200);
    listbox = openListbox(input);
  }
  if (!listbox) {
    return { error: 'The combobox has no open menu.', key: input.getAttribute(KeyAttribute) };
  }
  const options = optionsIn(listbox)
    .map((option) => clean(option.innerText))
    .filter((text) => text !== '' && !Placeholder.test(text));
  input.setAttribute(OptionsAttribute, JSON.stringify(options));
  input.blur();
  return { key: input.getAttribute(KeyAttribute), options };
`;

/**
 * Chooses an option from the menu that is open — a combobox opened by a click, or a typeahead's
 * suggestions after its text was typed through the browser server. It takes the option equal to
 * the value, then one beginning with it, then, for a place, one whose leading part before a comma
 * matches the value's, preferring the one that contains the most hints. It reports the options
 * when none fits rather than guessing.
 */
const ChooseOperation = `
  const input = document.activeElement;
  let listbox = null;
  for (let attempt = 0; attempt < 15 && !listbox; attempt += 1) {
    await wait(200);
    listbox = input ? openListbox(input) : null;
  }
  if (!listbox) return { chosen: null, error: 'No menu is open.' };
  const norm = (text) => clean(text).toLowerCase();
  const head = (text) => norm(text).split(',')[0];
  const options = optionsIn(listbox).filter((option) => clean(option.innerText));
  const hintCount = (option) =>
    want.hints.filter((hint) => norm(option.innerText).includes(norm(hint))).length;
  const sameHead = options
    .filter((option) => head(option.innerText) === head(want.value))
    .sort((a, b) => hintCount(b) - hintCount(a));
  const choice =
    options.find((option) => norm(option.innerText) === norm(want.value)) ||
    options.find((option) => norm(option.innerText).startsWith(norm(want.value))) ||
    sameHead[0];
  if (!choice) {
    return { chosen: null, options: options.map((option) => clean(option.innerText)).slice(0, 40) };
  }
  choice.click();
  await wait(400);
  return { chosen: clean(choice.innerText) };
`;

/**
 * Fills the native fields of a plan: text through the value setter React and its peers observe,
 * a select by its option's text, radios and checkboxes by clicking the option whose text the reader
 * reported. Fields are filled one at a time, with a short random pause between them.
 *
 * A radio or checkbox wrapped in an element with the `radio` or `checkbox` role is clicked through
 * the wrapper, which is what LinkedIn listens to, and a group's members are found by name as well
 * as by key, because a re-render replaces the selected option's input without the key stamped on
 * it.
 */
const FillOperation = `
  const prototypes = {
    INPUT: HTMLInputElement,
    SELECT: HTMLSelectElement,
    TEXTAREA: HTMLTextAreaElement,
  };
  const setValue = (el, value) => {
    Object.getOwnPropertyDescriptor(prototypes[el.tagName].prototype, 'value').set.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const toggle = (member) =>
    (member.closest('[role="radio"], [role="checkbox"]') || member).click();
  const results = [];
  for (const fill of fills) {
    const stamped = [...document.querySelectorAll('[' + KeyAttribute + '="' + fill.key + '"]')];
    const byId = fill.key.startsWith('id:') ? document.getElementById(fill.key.slice(3)) : null;
    const keyed = stamped.length > 0 ? stamped : byId ? [byId] : [];
    const named = fill.key.startsWith('name:')
      ? [...document.querySelectorAll('input[name="' + CSS.escape(fill.key.slice(5)) + '"]')]
      : keyed[0] && keyed[0].name
      ? [...document.querySelectorAll('input[name="' + CSS.escape(keyed[0].name) + '"]')]
      : [];
    const members = [...new Set([...keyed, ...named])];
    const el = members[0];
    if (!el) {
      results.push({ key: fill.key, ok: false, reason: 'The field is no longer on the page.' });
      continue;
    }
    el.scrollIntoView({ block: 'center' });
    el.focus();
    if (fill.type === 'select') {
      const option = [...el.options].find((candidate) => clean(candidate.text) === fill.value);
      if (!option) {
        results.push({ key: fill.key, ok: false, reason: 'No option reads ' + fill.value + '.' });
        continue;
      }
      setValue(el, option.value);
    } else if (fill.type === 'radio' && pressButtons(el).length > 1) {
      const button = pressButtons(el)
        .find((candidate) => clean(candidate.innerText) === fill.value);
      if (!button) {
        results.push({ key: fill.key, ok: false, reason: 'No option reads ' + fill.value + '.' });
        continue;
      }
      if (button.getAttribute('aria-pressed') !== 'true') button.click();
    } else if (fill.type === 'radio') {
      const member = members.find((candidate) => optionText(candidate) === fill.value);
      if (!member) {
        results.push({ key: fill.key, ok: false, reason: 'No option reads ' + fill.value + '.' });
        continue;
      }
      if (!member.checked) toggle(member);
    } else if (fill.type === 'checkbox' && Array.isArray(fill.value)) {
      members
        .filter((member) => member.checked !== fill.value.includes(optionText(member)))
        .forEach(toggle);
    } else if (fill.type === 'checkbox') {
      if (el.checked !== fill.value) toggle(el);
    } else {
      setValue(el, fill.value);
    }
    el.blur();
    results.push({ key: fill.key, ok: true });
    await wait(250 + Math.floor(Math.random() * 600));
  }
  return { results };
`;

/**
 * Reads the page after Submit was clicked, waiting up to ten seconds for a confirmation: Easy
 * Apply's "Your application was sent", Greenhouse's and Ashby's thanks. Without one it reports the
 * page's visible errors and text instead. It never clicks: an unconfirmed submission is deferred to
 * Nick rather than retried, because a retry after a success that went unseen sends a duplicate.
 */
const SubmissionResultScript = `async () => {${FormHelpers}
  const Confirmed = new RegExp(
    'your application was sent|application (?:was )?(?:submitted|sent|received)|' +
      'thank(?:s| you) for (?:applying|your application|your interest)|' +
      'we(?:\\'|’)ve received your application|successfully submitted',
    'i',
  );
  const scope = () =>
    [...document.querySelectorAll('dialog[open], [role="dialog"]')].filter(visible).pop() ||
    document.body;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const match = Confirmed.exec(scope().innerText);
    if (match) return { confirmed: true, matched: match[0], url: window.location.href };
    await wait(500);
  }
  const errors = [...document.querySelectorAll('[role="alert"], [aria-invalid="true"] ~ *')]
    .filter(visible)
    .map((el) => clean(el.innerText))
    .filter(Boolean)
    .slice(0, 10);
  return {
    confirmed: false,
    errors,
    text: scope().innerText.slice(0, 1500),
    url: window.location.href,
  };
}`;

/**
 * Finds the direct link to an application form embedded in an employer's own careers page — the
 * `ashby_jid` or `gh_jid` in the page's address names the job — among the page's links and frames
 * on the application system's own host, where the form can be read and filled.
 */
const EmbeddedBoardScript = `async () => {${FormHelpers}
  const params = new URLSearchParams(window.location.search);
  const job = params.get('ashby_jid') || params.get('gh_jid');
  if (!job) return { href: null, reason: 'The address names no embedded job.' };
  const Hosts = /^https:\\/\\/(?:jobs\\.ashbyhq\\.com|(?:job-)?boards\\.greenhouse\\.io)\\//;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const found = [...document.querySelectorAll('a[href], iframe[src]')]
      .map((el) => el.href || el.src)
      .find((url) => Hosts.test(url) && url.includes(job));
    if (found) return { href: found };
    await wait(500);
  }
  return { href: null, reason: 'No link on the page leads to the job on its board.' };
}`;

/**
 * Makes a read file input visible and names it, so that a snapshot shows it and the browser
 * server's upload tool can set its file. Workday's "Select files" button opens no file chooser the
 * tool can catch, and its input is hidden.
 */
const RevealOperation = `
  const input = [...document.querySelectorAll('input[type="file"]')]
    .find((candidate) => candidate.getAttribute(KeyAttribute) === key);
  if (!input) return { error: 'No read file input has that key.', key };
  input.removeAttribute('hidden');
  input.style.cssText = 'display:block !important;height:30px;opacity:1;position:static;' +
    'visibility:visible;width:200px;';
  input.title = '${RevealedFileInputName}';
  return { key, name: '${RevealedFileInputName}' };
`;

/**
 * The global the form tools are installed on, by the first reading of a page.
 */
const FormToolsGlobal = 'window.__jobSearchForms';

/**
 * Reads the form in view, installing the form tools on the page as it does: the
 * {@link ReadOperation}, {@link ProbeOperation}, {@link ChooseOperation}, {@link FillOperation} and
 * {@link RevealOperation}, sharing the {@link FormHelpers}.
 *
 * The tools stay on the page for as long as it is not reloaded or navigated away from — through
 * every step of Easy Apply's dialog and Workday's application — so that every later call is one
 * line rather than the whole of the tools again. After a navigation the one-line calls report that
 * the tools are gone, and the form is read with this script again.
 */
const FormReadScript = `() => {
  ${FormToolsGlobal} = (() => {${FormHelpers}
  const read = () => {${ReadOperation}};
  const probe = async () => {${ProbeOperation}};
  const choose = async (want) => {${ChooseOperation}};
  const fill = async (fills) => {${FillOperation}};
  const reveal = (key) => {${RevealOperation}};
  return { choose, fill, probe, read, reveal };
  })();
  return ${FormToolsGlobal}.read();
}`;

/**
 * What a call to the form tools returns on a page they are not installed on.
 */
export const FormToolsGoneMessage =
  'The form tools are not on this page: run the form-read script, then try again.';

/**
 * Builds a script that calls one of the form tools the {@link FormReadScript} installed, or reports
 * that a navigation removed them.
 */
const formToolCall = (call: string): string =>
  `async () => (${FormToolsGlobal} ? ${FormToolsGlobal}.${call} : { error: ${JSON.stringify(
    FormToolsGoneMessage,
  )} })`;

/**
 * Builds the script that chooses one value from the open menu, through the {@link ChooseOperation}.
 *
 * @param {string} value The option to choose, as the plan states it.
 * @param {readonly string[]} hints Words that favor one of several suggestions sharing a name.
 *
 * @returns {string} The script, for the browser server's `evaluate_script` tool.
 */
export const chooseOptionScript = (value: string, hints: readonly string[] = []): string =>
  formToolCall(`choose(${JSON.stringify({ hints, value: value.trim() })})`);

/**
 * Builds the script that fills a plan's native fields, through the {@link FillOperation}.
 *
 * @param {readonly PlannedFill[]} fills The native fills of a plan.
 *
 * @returns {string} The script, for the browser server's `evaluate_script` tool.
 */
export const formFillScript = (fills: readonly PlannedFill[]): string =>
  formToolCall(
    `fill(${JSON.stringify(fills.map(({ key, type, value }) => ({ key, type, value })))})`,
  );

/**
 * Builds the script that reveals a read file input for an upload, through the
 * {@link RevealOperation}.
 *
 * @param {string} key The key the reader stamped on the file input.
 *
 * @returns {string} The script, for the browser server's `evaluate_script` tool.
 */
export const revealFileInputScript = (key: string): string =>
  formToolCall(`reveal(${JSON.stringify(key)})`);

/**
 * The application-form scripts that take no parameters, by name. `form-read` installs the form
 * tools and reads the form; `form-reread` and `combobox-options` call tools it installed.
 */
export const FormScripts = {
  'combobox-options': formToolCall('probe()'),
  'embedded-board': EmbeddedBoardScript,
  'form-read': FormReadScript,
  'form-reread': formToolCall('read()'),
  'submission-result': SubmissionResultScript,
} as const;
