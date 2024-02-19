import { generateJson } from "./fixtures";

try {
  generateJson();
} catch (e) {
  /* eslint-disable-next-line no-console */
  console.error(e);
  process.exit(1);
}
