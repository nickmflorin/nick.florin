export const DeviceClasses = ['desktop', 'mobile', 'tablet'] as const;

/**
 * The coarse class of device that can be inferred from a request's User-Agent on the server.
 *
 * A User-Agent reliably distinguishes only between these broad classes; it never reveals the
 * actual pixel width of the layout viewport. The class is therefore mapped to a representative
 * width (see {@link ViewportSeedWidths}) rather than an exact measurement.
 */
export type DeviceClass = (typeof DeviceClasses)[number];

export const isDeviceClass = (value: null | string | undefined): value is DeviceClass =>
  typeof value === 'string' && DeviceClasses.includes(value as DeviceClass);

/**
 * The request header the middleware writes the inferred {@link DeviceClass} onto, so that the
 * layout can derive an initial viewport width for server rendering without re-parsing the
 * User-Agent.
 *
 * It is set on the forwarded request headers (not the response), so it is only ever visible to
 * server-side rendering and never sent back to the browser.
 */
export const ViewportDeviceHeader = 'x-viewport-device';

/**
 * Maps each {@link DeviceClass} to the representative viewport width (in pixels) that server
 * rendering assumes for requests of that class.
 *
 * The widths are representative, not measured — the true viewport width is unknowable on the
 * server. They exist so the server renders the correct responsive variant (desktop sidebar
 * versus mobile menu, for example) for the device class, and the client's resize listener
 * replaces them with the real window dimensions before the first paint after hydration.
 */
export const ViewportSeedWidths = {
  desktop: 1440,
  mobile: 390,
  tablet: 820,
} as const satisfies Record<DeviceClass, number>;

/**
 * Maps the device types Next's `userAgent` helper commonly reports to the {@link DeviceClass}
 * each is treated as.
 *
 * The key set is open — the underlying User-Agent parser can report values outside this map, and
 * an absent `device.type` conventionally means desktop — so lookups fall back to `'desktop'`
 * rather than being exhaustive.
 */
export const DeviceClassByUserAgentDeviceType: Record<string, DeviceClass | undefined> = {
  console: 'desktop',
  embedded: 'desktop',
  mobile: 'mobile',
  // cspell:disable-next-line
  smarttv: 'desktop',
  tablet: 'tablet',
  wearable: 'desktop',
};
