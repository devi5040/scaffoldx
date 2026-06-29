import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import ora from "ora";

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
