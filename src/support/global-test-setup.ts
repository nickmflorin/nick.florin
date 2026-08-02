export const globalTestSetup = () => {
  // Set the timezone for Jest tests to be UTC.
  process.env.TZ = 'UTC';
};
