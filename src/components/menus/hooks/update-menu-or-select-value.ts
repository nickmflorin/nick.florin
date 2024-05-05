import isEqual from "lodash.isequal";

export const updateMenuOrSelectValue = <T extends V | V[] | null, V>(
  prev: T,
  // The value corresponding to the menu item that was just selected.
  selectedValue: V | null,
  options: { isNullable?: boolean; isDeselectable?: boolean },
): T => {
  if (Array.isArray(prev)) {
    const isAlreadySelected = prev.filter(v => isEqual(v, selectedValue)).length > 0;
    /* If the value is already selected, and the 'isDeselectable' is not false, deselect it.
       Otherwise, do not alter the value. */
    if (isAlreadySelected) {
      if (options.isDeselectable !== false) {
        return prev.filter(v => !isEqual(v, selectedValue)) as T;
      }
      return prev;
    }
    // If the value is not already selected, add it to the selection.
    return [...prev, selectedValue] as T;
  } else if (options.isNullable !== false) {
    /* If the value is already selected, and the 'isNullable' option is not set to false, and the
       'isDeselectable' option is also not false, deselect the value. */
    if (isEqual(prev, selectedValue) && options.isDeselectable !== false) {
      return null as T;
    }
    // Here, nothing should change - because the menu is not configured for deselection.
    return prev;
  } else if (selectedValue === null) {
    throw new TypeError("Unexpectedly encountered a null value for a non-nullable menu or select.");
  }
  return selectedValue as T;
};
