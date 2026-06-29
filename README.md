# ⚡ Scaffinity

> Generate, export, and share project structures as portable JSON blueprints — with a single command.

[![npm version](https://img.shields.io/npm/v/scaffinity.svg)](https://www.npmjs.com/package/scaffinity)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/devi5040/scaffinity/pulls)

---

## The Problem

Every new project starts the same way — manually creating folders, files, config boilerplate. You either do it by hand each time or maintain a growing list of templates nobody on your team can find.

**Scaffinity fixes this.** Define your entire project structure in a single JSON file. Generate it anywhere. Share it with anyone.

---

## Install

```bash
npm install -g scaffinity
```

---

## Three Commands

### 1. `generate` — JSON blueprint → real project

```bash
scaffinity generate blueprint.json
scaffinity generate blueprint.json -o ./my-new-project
scaffinity generate blueprint.json --dry --verbose   # preview first
```

### 2. `export` — existing project → JSON blueprint

```bash
scaffinity export ./my-project -o blueprint.json
scaffinity export . --ignore dist coverage --depth 4
```

### 3. `init` — build a blueprint interactively

```bash
scaffinity init
```

---

## Blueprint Format

A blueprint is just a JSON file. Objects are directories, strings or `null` are files.

```json
{
  "src": {
    "modules": {
      "auth": {
        "auth.controller.ts": "",
        "auth.service.ts": "",
        "auth.routes.ts": ""
      }
    },
    "middleware": {
      "error.middleware.ts": ""
    },
    "main.ts": "import express from 'express'\n\nconst app = express()\n"
  },
  ".env.example": "PORT=3000\nNODE_ENV=development",
  ".gitignore": "node_modules\ndist\n.env\n"
}
```

Files with string values get that content written directly. `null` creates an empty file.

---

## Real World Example

**Generate a full Express + TypeScript API structure:**

```bash
# Download the community blueprint
curl -O https://raw.githubusercontent.com/devi5040/scaffinity/main/examples/express-ts-api.json

# Generate the project
scaffinity generate express-ts-api.json -o ./my-api
```

Output:

```
✅ Blueprint loaded

  mkdir: my-api/src
  mkdir: my-api/src/modules
  mkdir: my-api/src/modules/auth
  create: my-api/src/modules/auth/auth.controller.ts
  create: my-api/src/modules/auth/auth.service.ts
  ...

📦 Scaffinity Summary
────────────────────────────────────────
  ✓ Created : 25 files/dirs
────────────────────────────────────────

✅ Project structure generated at: ./my-api
```

**Export your current project as a shareable blueprint:**

```bash
scaffinity export ./my-project -o team-blueprint.json
# Share team-blueprint.json with your team — they run one command to replicate your structure
```

---

## Options

### `generate`

| Option               | Description                                   |
| -------------------- | --------------------------------------------- |
| `-o, --output <dir>` | Output directory (default: current directory) |
| `-d, --dry`          | Dry run — preview without creating files      |
| `-v, --verbose`      | Show each file/folder being created           |

### `export`

| Option                       | Description                              |
| ---------------------------- | ---------------------------------------- |
| `-o, --output <file>`        | Save blueprint to file (default: stdout) |
| `-i, --ignore <patterns...>` | Additional patterns to ignore            |
| `--depth <number>`           | Maximum directory depth (default: 10)    |

---

## Community Blueprints

Ready-made blueprints in the [`/examples`](./examples) folder:

| Blueprint                                               | Description                   |
| ------------------------------------------------------- | ----------------------------- |
| [`express-ts-api.json`](./examples/express-ts-api.json) | Express + TypeScript REST API |
| [`nextjs-app.json`](./examples/nextjs-app.json)         | Next.js App Router project    |

**Have a blueprint to share?** Open a PR and add it to `/examples`.

---

## Programmatic Usage

```typescript
import { generateCommand, exportCommand } from "scaffinity";

// Generate from a blueprint object directly
await generateCommand("blueprint.json", {
  output: "./my-project",
  verbose: true,
});

// Export a project to blueprint
await exportCommand("./existing-project", {
  output: "blueprint.json",
  ignore: ["dist", "coverage"],
});
```

---

## Why Scaffinity over Yeoman / degit / framework CLIs?

|                         | Scaffinity | Yeoman | degit | Framework CLIs |
| ----------------------- | ---------- | ------ | ----- | -------------- |
| Language agnostic       | ✅         | ✅     | ✅    | ❌             |
| Portable JSON format    | ✅         | ❌     | ❌    | ❌             |
| Export existing project | ✅         | ❌     | ❌    | ❌             |
| Zero config             | ✅         | ❌     | ✅    | ✅             |
| File content support    | ✅         | ✅     | ✅    | ✅             |
| Shareable blueprint     | ✅         | ❌     | ✅    | ❌             |

---

## Contributing

PRs are welcome. To add a community blueprint, add a JSON file to `/examples` and open a PR.

```bash
git clone https://github.com/devi5040/scaffinity
cd scaffinity
npm install
npm run dev -- generate examples/express-ts-api.json --dry --verbose
```

---

## License

MIT © [Deviprasad Rai](https://github.com/devi5040)
