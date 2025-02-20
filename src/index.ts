#!/usr/bin/env node

import yargs from "yargs";
import chokidar from "chokidar";
import { convert } from "./converter.ts";
import * as fs from "node:fs/promises";
import path from "node:path";
import { exec } from "./exec/exec.ts";

type Config = {
  openapi: string;
  output: string;
  tsconfig: string;
  hook?: {
    after?: string;
  };
};

const args = await yargs(process.argv.slice(2))
  .command("generate", "Convert openapi schema to fastify routes")
  .command("watch", "Watch the openapi schema file for changes")
  .option("config", {
    alias: "c",
    type: "string",
    description: "Path to the config file",
  })
  .demandCommand(1)
  .parse();

const configPath = args.config as string;
const basePath = path.dirname(configPath);

const content = await fs.readFile(configPath, "utf-8");
const watchMode = args._[0] === "watch";
const config = JSON.parse(content) as Config;

const after = config.hook?.after;

if (watchMode) {
  const watcher = chokidar.watch(path.join(basePath, config.openapi), {
    persistent: true,
  });
  console.log("Watching openapi schema file for changes...");

  watcher.on("change", async () => {
    console.info("Openapi schema file changed, regenerating routes...");
    convert({
      openApiFilePath: path.join(basePath, config.openapi),
      output: path.join(basePath, config.output),
      tsconfigPath: path.join(basePath, config.tsconfig),
    });
    if (after != null) {
      await exec(after, { basePath });
    }
  });
} else {
  convert({
    openApiFilePath: path.join(basePath, config.openapi),
    output: path.join(basePath, config.output),
    tsconfigPath: path.join(basePath, config.tsconfig),
  });
  if (after != null) {
    await exec(after, { basePath });
  }
}
