import fs from "fs";

import {
  Jsonifiers,
  getModelJsonFixtureFilePath,
  type Jsonifier,
  type JsonifiableModel,
} from "~/database/fixtures";
import { pluralizeBrandModel } from "~/database/model";
import { db } from "~/database/prisma";
import { cli } from "~/scripts";
import { stdout } from "~/support";

const script: cli.Script = async () => {
  const live = cli.getBooleanCliArgument("live", { defaultValue: false });

  await db.$transaction(async tx => {
    let key: JsonifiableModel;
    for (key in Jsonifiers) {
      const jsonifier = Jsonifiers[key] as Jsonifier<typeof key>;

      stdout.begin(`Generating fixtures for model '${key}'...`);
      const data = await jsonifier.data(tx);
      const jsonified = data.map(d => jsonifier.jsonify(d));

      const [dir, filename] = getModelJsonFixtureFilePath(key, { live });
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
};

cli.runScript(script, { upsertUser: true, devOnly: true });
