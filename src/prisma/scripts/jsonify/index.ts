import fs from "fs";

import qs from "qs";

import type * as types from "./types";

import { prisma } from "~/prisma/client";
import { pluralizeBrandModel } from "~/prisma/model";
import { stdout } from "~/prisma/scripts/stdout";

import { getModelJsonFixtureFilePath } from "./constants";
import { Jsonifiers, type Jsonifier } from "./jsonifiers";

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

  prisma.$transaction(async tx => {
    let key: types.JsonifiableModel;
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
    await prisma.$disconnect();
  })
  .catch(async e => {
    /* eslint-disable-next-line no-console */
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
