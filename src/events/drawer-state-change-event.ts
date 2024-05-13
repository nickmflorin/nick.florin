export const DRAWER_STATE_CHANGE_EVENT_NAME = "drawerStateChanged" as const;

export function subscribe(listener: <D extends DrawerId>(evt: DrawerStateChangeEvent<D>) => void) {
  document.addEventListener(DRAWER_STATE_CHANGE_EVENT_NAME, listener);
}

export function unsubscribe(
  listener: <D extends DrawerId>(evt: DrawerStateChangeEvent<D>) => void,
) {
  document.removeEventListener(DRAWER_STATE_CHANGE_EVENT_NAME, listener);
}

export function publish<D extends DrawerId>(data: DrawerStateChangeEventDetail<D>) {
  const event = new CustomEvent(DRAWER_STATE_CHANGE_EVENT_NAME, { detail: data });
  document.dispatchEvent(event);
}
