import {SuiCodegenConfig} from "@mysten/codegen";

const config: SuiCodegenConfig = {
  output: './src/generated',
  generateSummaries: true,
  prune: true,
  packages: [
    {
      package: '@local-pkg/solitaire',
      path: '../move/solitaire',
      packageName: 'solitaire',
    },
  ],
};

export default config;