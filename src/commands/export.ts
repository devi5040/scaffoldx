import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import ora from "ora";
import { ExportOptions, StructureNode } from "../types";

const DEFAULT_IGNORE = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".nuxt",
  "coverage",
  ".DS_Store",
  "Thumbs.db",
  "*.log",
  ".env",
  ".env.local",
];

function matchesIgnore(name: string, ignoreList: string[]): boolean {
  return ignoreList.some((pattern) => {
    if (pattern.startsWith("*")) return name.endsWith(pattern.slice(1));
    return name === pattern;
  });
}

async function buildStructure(
  dirPath: string,
  ignoreList: string[],
  currentDepth: number,
  maxDepth: number,
): Promise<StructureNode> {
  const result: StructureNode = {};
  if (currentDepth > maxDepth) return result;

  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (matchesIgnore(entry.name, ignoreList)) continue;

    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory())
      result[entry.name] = await buildStructure(
        fullPath,
        ignoreList,
        currentDepth + 1,
        maxDepth,
      );
    else if (entry.isFile()) result[entry.name] = null; // null = empty file placeholder
  }

  return result;
}

export async function exportCommand(
  projectPath: string,
  options: ExportOptions,
): Promise<void> {
  const spinner = ora("Scanning project structure...").start();

  try {
    const absolutePath = path.resolve(process.cwd(), projectPath);

    if (!(await fs.pathExists(absolutePath))) {
      spinner.fail(chalk.red(`Path not found: ${projectPath}`));
      process.exit(1);
    }

    const stat = await fs.stat(absolutePath);
    if (!stat.isDirectory()) {
      spinner.fail(chalk.red(`Path is not a directory: ${projectPath}`));
      process.exit(1);
    }

    const ignoreList = [...DEFAULT_IGNORE, ...(options.ignore ?? [])];
    const maxDepth = options.depth ?? 10;

    const structure = await buildStructure(
      absolutePath,
      ignoreList,
      0,
      maxDepth,
    );

    spinner.succeed("Structure scanned");

    const json = JSON.stringify(structure, null, 2);

    if (options.output) {
      const outputPath = path.resolve(process.cwd(), options.output);
      await fs.writeFile(outputPath, json, "utf-8");
      console.log(
        chalk.green(`\n✅ Blueprint exported to: ${chalk.bold(outputPath)}\n`),
      );
    } else
      // Print to stdout so it can be piped
      console.log(json);

    // Stats
    const fileCount = (json.match(/:null/g) ?? []).length;
    const dirCount = Object.keys(structure).length;

    if (options.output) {
      console.log(
        chalk.dim(`   Directories: ${dirCount} | Files: ${fileCount}`),
      );
      console.log(chalk.dim(`   Ignored: ${ignoreList.join(", ")}\n`));
    }
  } catch (error) {
    spinner.fail(chalk.red("Export failed"));
    console.error(error);
    process.exit(1);
  }
}
