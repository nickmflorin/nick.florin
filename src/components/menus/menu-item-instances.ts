import { type MouseEvent } from 'react';

export type MenuItemClickEvent = KeyboardEvent | MouseEvent<HTMLDivElement>;

/**
 * Represents a more specific sub-type of {@link MenuItemInstance} that has NOT been connected to
 * the UI yet.  In other words, the ref-relationship between the
 * {@link DisconnectedMenuItemInstance} and the MenuItem has not yet been established, because the
 * MenuItem has not yet been rendered in the UI.
 *
 * This can happen when optimistic models are added to the data rendered by a DataMenu.  In certain
 * cases, the {@link MenuItemInstance} associated with the model will have to be created before
 * the MenuItem associated with the model is rendered in the UI.
 */
export type DisconnectedMenuItemInstance = {
  readonly isConnected: false;
  readonly setDisabled: (value: boolean) => void;
  readonly setLoading: (value: boolean) => void;
  readonly setLocked: (value: boolean) => void;
};

/**
 * Represents a more specific sub-type of {@link MenuItemInstance} that has been connected to
 * the UI.  When the MenuItem associated with the {@link DisconnectedMenuItemInstance} is rendered
 * in the UI, the {@link DisconnectedMenuItemInstance} becomes a {@link ConnectedMenuItemInstance}
 * because the ref-relationship with the MenuItem is established when it is rendered.
 */
export type ConnectedMenuItemInstance = {
  readonly isConnected?: true;
  readonly setDisabled: (value: boolean) => void;
  readonly setLoading: (value: boolean) => void;
  readonly setLocked: (value: boolean) => void;
};

export type MenuItemInstance = ConnectedMenuItemInstance | DisconnectedMenuItemInstance;

export type DataMenuModelClickHandler = (
  e: MenuItemClickEvent,
  instance: ConnectedMenuItemInstance,
) => void;
