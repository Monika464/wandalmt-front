// jest.config.js
export default {
  roots: ["<rootDir>/src", "<rootDir>/__tests__"],
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jsdom",

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg|woff|woff2|ttf)$":
      "<rootDir>/__mocks__/fileMock.js",
  },

  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        useESM: true,
      },
    ],
  },

  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  testPathIgnorePatterns: ["/node_modules/", "/dist/"],

  extensionsToTreatAsEsm: [".ts", ".tsx"],

  // USUŃ sekcję globals całkowicie
};
// // jest.config.js
// export default {
//   roots: ["<rootDir>/src", "<rootDir>/__tests__"],
//   testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
//   setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
//   testEnvironment: "jsdom",

//   moduleNameMapper: {
//     // Dla aliasów Vite jeśli masz w vite.config.ts
//     "^@/(.*)$": "<rootDir>/src/$1",
//     "^@components/(.*)$": "<rootDir>/src/components/$1",
//     "^@utils/(.*)$": "<rootDir>/src/utils/$1",

//     // Mocks dla stylów i assetów
//     "\\.(css|less|scss|sass)$": "identity-obj-proxy",
//     "\\.(jpg|jpeg|png|gif|svg|woff|woff2|ttf)$":
//       "<rootDir>/__mocks__/fileMock.js",
//   },

//   transform: {
//     // Dla TypeScript z ESM (Vite)
//     "^.+\\.(ts|tsx)$": [
//       "ts-jest",
//       {
//         tsconfig: "tsconfig.json",
//         useESM: true,
//         diagnostics: {
//           ignoreCodes: [1343],
//         },
//         astTransformers: {
//           before: [
//             {
//               path: "node_modules/ts-jest-mock-import-meta",
//               options: {
//                 metaObjectReplacement: {
//                   env: {
//                     VITE_API_URL: "http://localhost:3000",
//                     VITE_APP_TITLE: "Test App",
//                   },
//                 },
//               },
//             },
//           ],
//         },
//       },
//     ],
//   },

//   moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

//   collectCoverageFrom: [
//     "src/**/*.{ts,tsx}",
//     "!src/**/*.d.ts",
//     "!src/main.tsx",
//     "!src/vite-env.d.ts",
//     "!src/**/index.ts",
//   ],

//   testPathIgnorePatterns: ["/node_modules/", "/dist/"],

//   // Ważne dla Vite/ESM
//   extensionsToTreatAsEsm: [".ts", ".tsx"],

//   // Jeśli masz problemy z import.meta
//   globals: {
//     "ts-jest": {
//       isolatedModules: true,
//     },
//   },
// };
