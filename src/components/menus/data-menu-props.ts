import { omit, pick } from 'lodash-es';

import { type DataMenuModel, type DataMenuOptions } from './data-menu-models';
import { type DataMenuProps } from './DataMenu';

export const DataMenuPropsMap = {
  /* eslint-disable-next-line camelcase -- The underscores intentionally mark this as an
     internal, non-public prop. */
  __private_parent_prop__: true,
  boldSubstrings: true,
  children: true,
  className: true,
  customItems: true,
  data: true,
  emptyContent: true,
  errorContent: true,
  errorMessage: true,
  errorTitle: true,
  feedbackClassName: true,
  feedbackStyle: true,
  footer: true,
  getItemDescription: true,
  getItemIcon: true,
  groupContentClassName: true,
  groupLabelClassName: true,
  groupLabelContainerClassName: true,
  groupLabelProps: true,
  groups: true,
  groupsAreBordered: true,
  hasKeyboardInteractions: true,
  hasNoResults: true,
  header: true,
  hideEmptyGroups: true,
  hideGrouplessItems: true,
  id: true,
  isBordered: true,
  isDisabled: true,
  isEmpty: true,
  isError: true,
  isLoading: true,
  isLocked: true,
  itemCheckboxSize: true,
  itemClassName: true,
  itemDisabledClassName: true,
  itemHeight: true,
  itemIconClassName: true,
  itemIconSize: true,
  itemIsDisabled: true,
  itemIsLoading: true,
  itemIsLocked: true,
  itemIsSelected: true,
  itemIsVisible: true,
  itemLoadingClassName: true,
  itemLockedClassName: true,
  itemNavigatedClassName: true,
  itemSelectedClassName: true,
  itemSpinnerClassName: true,
  itemSpinnerSize: true,
  noResultsContent: true,
  onBlur: true,
  onFocus: true,
  onItemClick: true,
  onKeyboardNavigationExit: true,
  onSearch: true,
  options: true,
  search: true,
  selectionIndicator: true,
  shouldIncludeDescriptions: true,
  style: true,
} as const satisfies {
  [key in keyof Required<DataMenuProps<DataMenuModel, DataMenuOptions<DataMenuModel>>>]: true;
};

export const omitDataMenuProps = <
  P extends Record<string, unknown>,
  M extends DataMenuModel,
  O extends DataMenuOptions<M>,
>(
  props: P,
): Omit<P, keyof P & keyof typeof DataMenuPropsMap> =>
  omit(props, Object.keys(DataMenuPropsMap) as (keyof Required<DataMenuProps<M, O>>)[]);

export const pickDataMenuProps = <
  P extends Record<string, unknown>,
  M extends DataMenuModel,
  O extends DataMenuOptions<M>,
>(
  props: P,
): Pick<P, keyof P & keyof typeof DataMenuPropsMap> =>
  pick(props, Object.keys(DataMenuPropsMap) as (keyof Required<DataMenuProps<M, O>>)[]);
