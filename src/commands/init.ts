import chalk from "chalk";
import { StructureNode } from "../types";
import prompts from "prompts";
import path from "path";
import fs from "fs-extra";

interface QueueItem {
  node: StructureNode;
  currentPath: string;
  label: string;
}

async function buildInteractive(): Promise<StructureNode> {
  const root: StructureNode = {};
  const queue: QueueItem[] = [{ node: root, currentPath: "/", label: "root" }];

  console.log(chalk.bold.cyan("\n Scaffoldx Interactive Builder"));
  console.log(chalk.dim("Build your project structure step by step.\n"));
  console.log(
    chalk.dim("Commands: add file -> type name with extension (e.g. index.ts)"),
  );
  console.log(
    chalk.dim("          add dir -> type name without extension (e.g. src)"),
  );
  console.log(chalk.dim("          done -> finish current directory\n"));

  while (queue.length > 0) {
    const current = queue.shift();

    console.log(chalk.blue(`\n ${current?.label} (${current?.currentPath})`));

    let continueAdding = true;

    while (continueAdding) {
      const { action } = await prompts({
        type: "select",
        name: "action",
        message: `Add to ${chalk.cyan(current!.label)}:`,
        choices: [
          { title: "Add file", value: "file" },
          { title: "Add directory", value: "dir" },
          { title: "Done with this directory", value: "done" },
        ],
      });

      if (!action || action === "done") {
        continueAdding = false;
        break;
      }

      if (action === "file") {
        const { fileName } = await prompts({
          type: "text",
          name: "fileName",
          message: "File name (e.g. index.ts, .env.example):",
          validate: (v) =>
            v.trim().length > 0 ? true : "File name should not be empty",
        });

        if (fileName) {
          const { content } = await prompts({
            type: "text",
            name: "content",
            message: "File content (leave empty for blank file):",
          });
          current!.node[fileName.trim()] = content?.trim() ?? null;
          console.log(chalk.green(` Added file: ${fileName.trim()}`));
        }
      }

      if (action === "dir") {
        const { dirName } = await prompts({
          type: "text",
          name: "dirName",
          message: "Directory Name",
          validate: (v) =>
            v.trim().length > 0 ? true : "Directory name cannot be empty",
        });

        if (dirName) {
          const newNode: StructureNode = {};
          current!.node[dirName.trim()] = newNode;
          console.log(chalk.blue(`Added directory: ${dirName.trim()}`));
          queue.push({
            node: newNode,
            currentPath: path.join(current!.currentPath, dirName.trim()),
            label: dirName.trim(),
          });
        }
      }
    }
  }
  return root;
}

export async function initCommand(): Promise<void> {
  try {
    const structure = await buildInteractive();

    console.log(chalk.bold("\n Your blueprint:\n"));
    console.log(chalk.dim(JSON.stringify(structure, null, 2)));

    const { outputFile } = await prompts({
      type: "text",
      name: "outputFile",
      message: "Save blueprint as: ",
      initial: "scaffold.json",
    });

    if (outputFile) {
      const outputPath = path.resolve(process.cwd(), outputFile);
      await fs.writeFile(
        outputPath,
        JSON.stringify(structure, null, 2),
        "utf-8",
      );
      console.log(
        chalk.green(`\n Blueprint saved to: ${chalk.bold(outputPath)}`),
      );
      console.log(
        chalk.dim(
          `\nRun: scaffoldx generate ${outputFile} to create your structure\n`,
        ),
      );
    }
  } catch (error) {
    console.error(chalk.red("Init failed"), error);
    process.exit(1);
  }
}
