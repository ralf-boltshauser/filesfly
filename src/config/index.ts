import colors from "ansi-colors";
import { mkdir } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { REQUIRED_ENV_VARS } from "./types";

/**
 * Gets the path to the config file
 * @returns Promise that resolves to the config file path
 */
export async function getConfigPath(): Promise<string> {
  const configDir = join(homedir(), ".config", "filesfly");
  const configPath = join(configDir, "filesfly.json");
  await mkdir(configDir, { recursive: true });
  return configPath;
}

/**
 * Shows an example config file
 * @param configPath Path where the config file should be created
 */
export function showConfigExample(configPath: string): void {
  console.log(colors.yellow("No config file found."));
  console.log(`Create one at: ${colors.cyan(configPath)}`);
  console.log("\nExample config:");
  console.log(
    colors.green(`
{
  "ENDPOINT": "your-endpoint",
  "ACCESS_KEY_ID": "your-access-key",
  "SECRET_ACCESS_KEY": "your-secret",
  "BUCKET": "your-bucket",
  "REGION": "your-region"
}`)
  );
}

/**
 * Loads configuration from file
 */
export async function loadConfig(): Promise<void> {
  const configPath = await getConfigPath();

  try {
    const configFile = Bun.file(configPath);
    if (await configFile.exists()) {
      const config = JSON.parse(await configFile.text());
      for (const [key, value] of Object.entries(config)) {
        process.env[key] = value as string;
      }
    } else {
      showConfigExample(configPath);
      process.exit(1);
    }
  } catch (error: any) {
    console.error(colors.red(`Error loading config: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Validates that all required environment variables are set
 */
export function validateEnvironmentVars(): void {
  const missingVars = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
  if (missingVars.length > 0) {
    console.error(colors.red("Missing required environment variables:"));
    missingVars.forEach((v) => console.error(colors.yellow(`  ${v}`)));
    console.error("\nPlease set them in your environment or .env file");
    process.exit(1);
  }
}
