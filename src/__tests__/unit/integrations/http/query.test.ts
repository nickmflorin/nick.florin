import { getQueryParams, addQueryParamsToUrl } from "~/integrations/http";

describe("getQueryParams() properly returns", () => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const CASES: [string, Record<string, any>][] = [
    [
      "https://nickflorin.com/api/skills?search=myskill&pageSize=10&page=4",
      { search: "myskill", pageSize: "10", page: "4" },
    ],
    [
      "api/skills?search=myskill&pageSize=10&page=4",
      { search: "myskill", pageSize: "10", page: "4" },
    ],
    ["/api/skills?search=myskill&pageSize=&page=4", { search: "myskill", page: "4", pageSize: "" }],
    ["https://nickflorin.com/api/skills", {}],
    ["https://nickflorin.com/api/skills?", {}],
    ["", {}],
  ];
  test.each(CASES)("(url = %s)", (url, expected) => {
    expect(getQueryParams(url)).toEqual(expected);
  });
});

describe("addQueryParamsToUrl() properly returns", () => {
  const CASES: [Record<string, string | number | boolean | undefined | null>, string, string][] = [
    [
      { search: "myskill", pageSize: 10, page: 4 },
      "https://nickflorin.com/api/skills",
      "https://nickflorin.com/api/skills?search=myskill&pageSize=10&page=4",
    ],
    [
      { search: "myskill", pageSize: null, page: 4 },
      "https://nickflorin.com/api/skills?pageSize=10",
      "https://nickflorin.com/api/skills?search=myskill&pageSize=&page=4",
    ],
    [
      { search: "myskill", pageSize: 12, page: 4 },
      "https://nickflorin.com/api/skills?filter=test&pageSize=10",
      "https://nickflorin.com/api/skills?search=myskill&pageSize=12&page=4",
    ],
    [
      { search: "myskill", pageSize: 12, page: "" },
      "https://nickflorin.com/api/skills?filter=test&pageSize=10",
      "https://nickflorin.com/api/skills?search=myskill&pageSize=12&page=",
    ],
    [
      { search: "myskill", pageSize: 12, page: undefined },
      "https://nickflorin.com/api/skills?filter=test&pageSize=10",
      "https://nickflorin.com/api/skills?search=myskill&pageSize=12&page=",
    ],
  ];
  test.each(CASES)("(params = %s)", (params, url, expected) => {
    expect(addQueryParamsToUrl(url, params)).toBe(expected);
  });
});
