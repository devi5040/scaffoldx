import path from "path";
import { GenerateOptions, ScaffoldResult, StructureNode } from "../types";
import chalk from "chalk";
import fs from "fs-extra";
import ora from "ora";

function isFileContent(value: unknown): boolean {
  return (
    typeof value === "string" ||
    value === null ||
    (typeof value === "object" && value != null && "template" in value)
  );
}

function resolveContent(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (
    typeof value === "object" &&
    "template" in (value as Record<string, unknown>)
  ) {
    const v = value as { template: string; options?: Record<string, unknown> };
    return `//Generated from template: ${v.template}\n// Options: ${JSON.stringify(v.options ?? {}, null, 2)}\n`;
  }
  return "";
}

async function processNode(
  node: StructureNode,
  currentPath: string,
  result: ScaffoldResult,
  options: GenerateOptions,
): Promise<void> {
  for (const [key, value] of Object.entries(node)) {
    const fullPath = path.join(currentPath, key);

    if (isFileContent(value)) {
      // It's a file
      if (options.dry) {
        result.created.push(fullPath);
        if (options.verbose) {
          console.log(
            chalk.cyan("  [dry] create file:"),
            chalk.white(fullPath),
          );
        }
      } else {
        try {
          await fs.ensureDir(path.dirname(fullPath));
          if (await fs.pathExists(fullPath)) {
            result.skipped.push(fullPath);
            if (options.verbose)
              console.log(chalk.yellow(" skip:"), chalk.white(fullPath));
          } else {
            await fs.writeFile(fullPath, resolveContent(value), "utf-8");
            result.created.push(fullPath);
            if (options.verbose)
              console.log(chalk.green("  create:"), chalk.white(fullPath));
          }
        } catch (error) {
          result.errors.push(fullPath);
          console.log(chalk.red(" error:"), chalk.white(fullPath));
        }
      }
    } else if (typeof value === "object" && value !== null) {
      // It's a directory
      if (!options.dry) await fs.ensureDir(fullPath);
      if (options.verbose)
        console.log(chalk.blue(" makedir:"), chalk.white(fullPath));
      await processNode(value as StructureNode, fullPath, result, options);
    }
  }
}

export async function generateCommand(
  jsonFile: string,
  options: GenerateOptions,
): Promise<void> {
  const spinner = ora({
    text: "Reading blueprint...",
    stream: process.stdout,
  }).start();

  try {
    const absoluteJson = path.resolve(process.cwd(), jsonFile);
    if (!(await fs.pathExists(absoluteJson))) {
      spinner.fail(chalk.red(`Blueprint file not found: ${jsonFile}`));
      process.exit(1);
    }

    const raw = await fs.readFile(absoluteJson, "utf-8");
    let structre: StructureNode;

    try {
      structre = JSON.parse(raw);
    } catch {
      spinner.fail(chalk.red("Invalid Json in blueprint file"));
      process.exit(1);
    }

    const outputDir = path.resolve(process.cwd(), options.output ?? ".");
    await fs.ensureDir(outputDir);

    spinner.succeed("Blueprint loaded");

    if (options.dry)
      console.log(chalk.yellow("\nDry-run - no files will be created\n"));

    if (options.verbose) console.log(chalk.dim("\nProcessing Structure:\n"));

    const result: ScaffoldResult = { created: [], skipped: [], errors: [] };
    await processNode(structre, outputDir, result, options);

    // Summary
    console.log("\n" + chalk.bold("Scaffinity summary"));
    console.log(chalk.dim("-".repeat(40)));
    console.log(
      chalk.green(`  ✓ Created : ${result.created.length} files/dirs`),
    );
    if (result.skipped.length > 0)
      console.log(
        chalk.yellow(`  ⚠ Skipped : ${result.skipped.length} (already exist)`),
      );

    if (result.errors.length > 0)
      console.log(chalk.red(`  ✗ Errors  : ${result.errors.length}`));

    console.log(chalk.dim("-".repeat(40)));

    if (!options.dry && result.created.length > 0)
      console.log(
        chalk.green(
          `\n✅ Project structure generated at: ${chalk.bold(outputDir)}\n`,
        ),
      );
  } catch (error) {
    spinner.fail(chalk.red("Generation failed"));
    console.error(error);
    process.exit(1);
  }
}
