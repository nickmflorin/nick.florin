type DBNumericParam = "port";

type DBParam = DBNumericParam | "name" | "host" | "password" | "user";

export type DatabaseParams<V extends string | undefined = string | undefined> = {
  [key in DBParam]: key extends DBNumericParam ? V | number : V;
};

type IsDatabaseParamsAssertion = (
  params: DatabaseParams,
) => asserts params is DatabaseParams<string>;

const assertIsDatabaseParams: IsDatabaseParamsAssertion = (params: DatabaseParams) => {
  const invalid = Object.keys(params).filter((k: string) => params[k as DBParam] === undefined);
  if (invalid.length !== 0) {
    throw new Error(`Configuration Error: Database parameters ${invalid.join(", ")} not defined!`);
  }
};

export const postgresConnectionString = (params: DatabaseParams): string => {
  assertIsDatabaseParams(params);
  return (
    `postgresql://${params.user}:${params.password}` +
    `@${params.host}:${params.port}/${params.name}`
  );
};
