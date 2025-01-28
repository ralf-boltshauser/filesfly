import colors from 'ansi-colors';
import { Command } from 'commander';
import { basename } from 'path';
import packageJson from '../../package.json';
import { loadConfig } from '../config';
import { createS3Client } from '../s3/client';
import { deleteFile } from '../s3/delete';
import { uploadFile } from '../s3/upload';
import { sanitizeFileName } from '../utils/file';

/**
 * Sets up the CLI interface
 * @returns Configured Commander instance
 */
export function setupCLI(): Command {
  return new Command()
    .name('ff')
    .description(colors.cyan('FilesFly - Fast and beautiful S3 file uploader'))
    .version(packageJson.version)
    .argument('<file>', 'File path to upload or S3 file to delete')
    .option('-o, --output <name>', 'Custom output filename')
    .option('-d, --delete', 'Delete file from S3 instead of uploading')
    .addHelpText(
      'after',
      `
Example usage:
  $ ff image.jpg                    # Upload with original filename
  $ ff data.csv -o report.csv       # Upload with custom filename
  $ ff image.jpg -d                 # Delete file from S3

Configuration:
  Create a config file at ~/.config/filesfly/filesfly.json with:
  {
    "ENDPOINT": "your-endpoint",
    "ACCESS_KEY_ID": "your-access-key",
    "SECRET_ACCESS_KEY": "your-secret",
    "BUCKET": "your-bucket",
    "REGION": "your-region"
  }
`
    );
}

/**
 * Main CLI handler
 */
export async function handleCLI(): Promise<void> {
  const program = setupCLI();
  program.parse();

  await loadConfig();

  const options = program.opts();
  const filePath = program.args[0];
  const client = createS3Client();

  if (options.delete) {
    await deleteFile(client, filePath);
  } else {
    const s3FileName = options.output
      ? sanitizeFileName(options.output)
      : sanitizeFileName(basename(filePath));
    await uploadFile(client, filePath, s3FileName);
  }
}
