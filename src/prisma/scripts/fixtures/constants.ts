export const JSON_FIXTURE_DIR = "./src/prisma/fixtures/json";

export const getJsonFixtureFilePath = (fileName: string): string => {
  if (fileName.includes(".")) {
    return `${JSON_FIXTURE_DIR}/${fileName}`;
  }
  return `${JSON_FIXTURE_DIR}/${fileName}.json`;
};
