export const DRAWER_STATE_CHANGE_EVENT_NAME = "drawerStateChanged" as const;

export function subscribe(listener: (evt: DrawerStateChangeEvent) => void) {
  document.addEventListener(DRAWER_STATE_CHANGE_EVENT_NAME, listener);
}

export function unsubscribe(listener: (evt: DrawerStateChangeEvent) => void) {
  document.removeEventListener(DRAWER_STATE_CHANGE_EVENT_NAME, listener);
}

export function publish(data: DrawerStateChangeEventDetail) {
  const event = new CustomEvent(DRAWER_STATE_CHANGE_EVENT_NAME, { detail: data });
  document.dispatchEvent(event);
}
