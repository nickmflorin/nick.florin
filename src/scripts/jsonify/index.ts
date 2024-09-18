import fs from "fs";

import qs from "qs";

import { stdout } from "~/application/support";
import {
  Jsonifiers,
  getModelJsonFixtureFilePath,
  type Jsonifier,
  type JsonifiableModel,
} from "~/database/fixtures";
import { pluralizeBrandModel } from "~/database/model";
import { db } from "~/database/prisma";

type ParsedArgs = { [key in string]: string | boolean | number };

const parseArgumentValue = (val: string): string | boolean | number => {
  const parsed = qs.parse(val);
  if (typeof parsed === "string" || typeof parsed === "number" || typeof parsed === "boolean") {
    return parsed;
  }
  throw new TypeError(`Encountered invalid argument value '${val}'.`);
};

const parseParameterizedArgs = (args: string[]) =>
  args.reduce((prev: ParsedArgs, curr: string) => {
    if (curr.includes("=")) {
      const parts = curr
        .split("=")
        .map(a => a.trim())
        .filter(a => a.length !== 0);
      if (parts.length !== 2) {
        throw new TypeError(`Encountered invalid argument '${curr}'.`);
      } else if (!parts[0].startsWith("--")) {
        throw new TypeError(`Encountered invalid argument '${curr}'.`);
      }
      return { ...prev, [parts[0]]: parseArgumentValue(parts[1]) };
    } else if (curr.startsWith("--")) {
      return { ...prev, [curr.slice(2)]: true };
    }
    return prev;
  }, {} as ParsedArgs);

async function main() {
  const args = parseParameterizedArgs(process.argv);

  await db.$transaction(async tx => {
    let key: JsonifiableModel;
    for (key in Jsonifiers) {
      const jsonifier = Jsonifiers[key] as Jsonifier<typeof key>;

      stdout.begin(`Generating fixtures for model '${key}'...`);
      const data = await jsonifier.data(tx);
      const jsonified = data.map(d => jsonifier.jsonify(d));

      const [dir, filename] = getModelJsonFixtureFilePath(key, {
        live: args.live === true,
      });

      if (!fs.existsSync(dir)) {
        stdout.info(`Directory ${dir} does not exist, creating...`);
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFile(
        filename,
        JSON.stringify({ [pluralizeBrandModel(key)]: jsonified }),
        "utf-8",
        err => {
          if (err) {
            stdout.failed(`There was an error writing the fixtures to file ${filename}: \n${err}`);
          } else {
            stdout.complete(`Successfully saved skills fixtures to file ${filename}.`);
          }
        },
      );
    }
  });
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async e => {
    /* eslint-disable-next-line no-console */
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
