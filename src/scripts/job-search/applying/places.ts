/**
 * The names of the United States' states and the District of Columbia, by postal abbreviation, so
 * that a place answered as "Washington, DC" can be recognized among a typeahead's suggestions,
 * which spell the region out: "Washington, District of Columbia, United States".
 */
const UsRegionNames = new Map<string, string>([
  ['AK', 'Alaska'],
  ['AL', 'Alabama'],
  ['AR', 'Arkansas'],
  ['AZ', 'Arizona'],
  ['CA', 'California'],
  ['CO', 'Colorado'],
  ['CT', 'Connecticut'],
  ['DC', 'District of Columbia'],
  ['DE', 'Delaware'],
  ['FL', 'Florida'],
  ['GA', 'Georgia'],
  ['HI', 'Hawaii'],
  ['IA', 'Iowa'],
  ['ID', 'Idaho'],
  ['IL', 'Illinois'],
  ['IN', 'Indiana'],
  ['KS', 'Kansas'],
  ['KY', 'Kentucky'],
  ['LA', 'Louisiana'],
  ['MA', 'Massachusetts'],
  ['MD', 'Maryland'],
  ['ME', 'Maine'],
  ['MI', 'Michigan'],
  ['MN', 'Minnesota'],
  ['MO', 'Missouri'],
  ['MS', 'Mississippi'],
  ['MT', 'Montana'],
  ['NC', 'North Carolina'],
  ['ND', 'North Dakota'],
  ['NE', 'Nebraska'],
  ['NH', 'New Hampshire'],
  ['NJ', 'New Jersey'],
  ['NM', 'New Mexico'],
  ['NV', 'Nevada'],
  ['NY', 'New York'],
  ['OH', 'Ohio'],
  ['OK', 'Oklahoma'],
  ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'],
  ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'],
  ['SD', 'South Dakota'],
  ['TN', 'Tennessee'],
  ['TX', 'Texas'],
  ['UT', 'Utah'],
  ['VA', 'Virginia'],
  ['VT', 'Vermont'],
  ['WA', 'Washington'],
  ['WI', 'Wisconsin'],
  ['WV', 'West Virginia'],
  ['WY', 'Wyoming'],
]);

/**
 * What to type into a typeahead for a value, and the words that pick the right suggestion.
 *
 * A typeahead searches better on a place's leading name alone — "Washington, DC" finds nothing
 * where "Washington" finds Washington, District of Columbia — so only the part before the first
 * comma is typed, and the rest, with a region's abbreviation spelled out, ranks the suggestions
 * that share that name.
 *
 * @param {string} value The planned value of the typeahead.
 *
 * @returns {{ readonly hints: string[]; readonly text: string }}
 *   The text to type, and the words that favor a suggestion.
 */
export const typeaheadQuery = (
  value: string,
): { readonly hints: string[]; readonly text: string } => {
  const parts = value.split(',').map(part => part.trim());
  return {
    hints: parts.slice(1).flatMap(part => {
      const name = UsRegionNames.get(part.toUpperCase());
      return name === undefined ? [part] : [part, name];
    }),
    text: parts.at(0) ?? value.trim(),
  };
};
