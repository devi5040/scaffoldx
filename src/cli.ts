#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import { generateCommand } from "./commands/generate";
import { exportCommand } from "./commands/export";
import { initCommand } from "./commands/init";

const program = new Command();

console.log(
  chalk.bold.cyan("\n Scaffinity") +
    chalk.dim(" - Project structure generator\n"),
);

program
  .name("scaffinity")
  .description(
    "Generate, export, and share project structures as portable JSON blueprints",
  )
  .version("1.0.0");

// GENERATE
program
  .command("generate <blueprint>")
  .alias("g")
  .description("Generate project structure from a JSON blueprint file")
  .option(
    "-o, --output <dir>",
    "Output directory (default: current repository)",
  )
  .option("-d, --dry", "Dry run - preview without creating files")
  .option("-v, --verbose", "Show each file/folder being created")
  .action(
    async (
      blueprint: string,
      options: { output?: string; dry?: boolean; verbose?: boolean },
    ) => {
      await generateCommand(blueprint, {
        output: options.output,
        dry: options.dry ?? false,
        verbose: options.verbose ?? false,
      });
    },
  );

// EXPORT
program
  .command("export <path>")
  .alias("e")
  .description("Export an existing project structure to a JSON blueprint")
  .option("-o, --output <file>", "Save blueprint to file (default: stdout)")
  .option("-i, --ignore <patterns...>", "Additional patterns to ignore")
  .option("--depth <number>", "Maximum directory depth (default: 10)", parseInt)
  .action(
    async (
      projectPath: string,
      options: { output?: string; ignore?: string[]; depth?: number },
    ) => {
      await exportCommand(projectPath, {
        output: options.output,
        ignore: options.ignore,
        depth: options.depth,
      });
    },
  );

//INIT
program
  .command("init")
  .alias("i")
  .description("Interactively build a JSON blueprint step by step")
  .action(async () => {
    await initCommand();
  });

// HELP EXAMPLES
program.addHelpText(
  "after",
  `
    ${chalk.bold("Examples:")}
    ${chalk.cyan("scaffinity generate blueprint.json")}          Generate from blueprint
    ${chalk.cyan("scaffinity generate blueprint.json -o ./app")} Generate into specific folder
    ${chalk.cyan("scaffinity export ./my-project -o out.json")}  Export existing project
    ${chalk.cyan("scaffinity init")}                             Interactive builder
    
    ${chalk.bold("Blueprint format:")}
    ${chalk.dim("{")}
    ${chalk.dim('   "src": {')}
    ${chalk.dim('       "index.ts":"",')}
    ${chalk.dim('       "utils":{')}
    ${chalk.dim('           "helper.ts":"// Your content here"')}
    ${chalk.dim("       }")}
    ${chalk.dim("   },")}
    ${chalk.dim(' "env.example":"PORT=3000\\nNODE_ENV=development"')}
    ${chalk.dim("}")}
    
    ${chalk.dim("Github: https://github.com/devi5040/scaffinity")}`,
);

program.parse(process.argv);

if (!process.argv.slice(2).length) program.outputHelp;
