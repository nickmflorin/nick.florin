const ModuleGroups = [
  ["application", "lib", "server", "database", "internal", "scripts", "support"],
  ["app", "actions", "api", "integrations", "environment"],
  ["components", "features", "hooks", "styles"],
];

const toAbsoluteImports = v => [`~/${v}`, `~/${v}/**`];

const toRelativeImports = (v, level) => {
  if (level && level < 1) {
    throw new Error("The 'level' must be larger than 1.");
  } else if (!level) {
    return Array.from({ length: 5 }).reduce(
      (prev, _, index) => [...prev, ...toRelativeImports(v, index + 1)],
      [],
    );
  }
  const pathPrefix = "../".repeat(level);
  return [`${pathPrefix}${v}`, `${pathPrefix}${v}/*`];
};

const RestrictedImportPatterns = [
  {
    group: ModuleGroups.reduce(
      (prev, group) => [
        ...prev,
        ...group.reduce((acc, module) => [...acc, ...toRelativeImports(module)], []),
      ],
      [],
    ),
    message: "Please use absolute imports instead.",
  },
  {
    group: ["clsx"],
    message: "Please import 'classNames' from '~/components/types' instead.",
  },
  {
    group: ["@prisma/client/*", "@prisma/client"],
    message: "Please import from '~/database/model` instead.",
  },
  {
    group: ["~/database/model/generated"],
    message: "Please import directly from '~/database/model` instead.",
  },
];

/* Rules that apply to all files in the project, regardless of file type. */
/** @type {import("eslint").Linter.Config["rules"]} */
const BASE_RULES = {
  "prettier/prettier": "error",
  curly: "error",
  "import/order": [
    "error",
    {
      groups: ["builtin", "external", "type", "internal", "parent", "sibling", "index", "object"],
      "newlines-between": "always",
      warnOnUnassignedImports: true,
      distinctGroup: true,
      pathGroupsExcludedImportTypes: ["react", "next"],
      pathGroups: [
        {
          pattern: "server-only",
          group: "builtin",
          position: "before",
        },
        {
          pattern: "{react,react/**,next,next/**}",
          group: "builtin",
          position: "after",
        },
        {
          pattern:
            "{@prisma,@prisma/**,prisma,prisma/**,server,server/**,application,application/**}",
          group: "external",
          position: "after",
        },
        {
          pattern: "{../*}",
          group: "sibling",
          position: "before",
        },
        {
          pattern: "{./*}",
          group: "sibling",
          position: "after",
        },
        ...ModuleGroups.map(group => ({
          pattern: `{${group
            .reduce((prev, v) => [...prev, ...toAbsoluteImports(v)], [])
            .join(",")}}`,
          group: "internal",
          position: "before",
        })),
      ],
      alphabetize: {
        order: "asc",
        caseInsensitive: true,
        orderImportKind: "asc",
      },
    },
  ],
  "import/newline-after-import": ["error"],
  "import/no-duplicates": "error",
  "import/no-unresolved": "error",
  "import/no-useless-path-segments": ["error", { noUselessIndex: true }],
  "max-len": [
    "error",
    {
      code: 100,
      comments: 100,
      tabWidth: 2,
      ignoreUrls: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true,
      /* eslint-disable-next-line quotes */
      ignorePattern: '^import\\s(.?)+(from|as)\\s"(.?)+";$',
    },
  ],
  "arrow-body-style": ["error", "as-needed"],
  "no-console": "error",
  "no-useless-escape": ["error"],
  "no-case-declarations": ["error"],
  "no-extra-boolean-cast": ["error"],
  "no-unused-vars": "warn",
  "no-multiple-empty-lines": "error",
  "multiline-comment-style": ["error", "bare-block"],
  "no-unexpected-multiline": "error",
  "object-curly-spacing": [1, "always"],
  "prefer-const": "error",
  quotes: [1, "double"],
  semi: [1, "always"],
  "no-restricted-imports": ["error", { patterns: RestrictedImportPatterns }],
};

/* Rules that apply to '.ts' or '.tsx' files. */
/** @type {import("eslint").Linter.Config["rules"]} */
const TS_BASE_RULES = {
  ...BASE_RULES,
  "@typescript-eslint/consistent-type-imports": [
    "warn",
    {
      prefer: "type-imports",
      fixStyle: "inline-type-imports",
    },
  ],
  /* The `no-explicit-any` rule does not play nicely with TypeScript when defining general forms of
     function or array types that require generic spread type arguments.  Specifying the
     'ignoreRestArgs' rule alleviates the problem to some degree, but does not introduce type safety
     concerns. */
  "@typescript-eslint/no-explicit-any": ["error", { ignoreRestArgs: true }],
  "@typescript-eslint/no-non-null-assertion": "error",
  /* In TypeScript projects, the root "no-unused-vars" rule does not work properly with types, and
     sometimes clashes with the "@typescript-eslint" version of the rule.  The "@typescript-eslint"
     version covers all the cases that the root "no-unused-vars" rule does, but works properly with
     types - so it is used in favor of the root "no-unused-vars" rule, not in conjunction with. */
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": ["warn", { destructuredArrayIgnorePattern: "^_" }],
  "react/jsx-newline": [1, { prevent: true }],
  "react/jsx-curly-brace-presence": [1, { props: "never", children: "never" }],
  "react/display-name": "off",
};

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "next/core-web-vitals",
    "plugin:prettier/recommended",
  ],
  rules: TS_BASE_RULES,
  ignorePatterns: [
    "next-env.d.ts",
    "!.*",
    "package.json",
    "package-lock.json",
    "src/database/prisma/migrations/*",
    "src/database/model/generated/*",
    "/node_modules/**",
    ".next/*",
  ],
};
