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
