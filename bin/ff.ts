#!/usr/bin/env bun
import colors from "ansi-colors";
import { handleCLI } from "../src/cli";

handleCLI().catch((error) => {
  console.error(colors.red(`\n✗ Unexpected error: ${error.message}`));
  process.exit(1);
});
