import colors from 'ansi-colors';
import { Command } from 'commander';
import { basename } from 'path';
import packageJson from '../../package.json';
import { loadConfig } from '../config';
import { checkConnection, createS3Client } from '../s3/client';
import { deleteFile } from '../s3/delete';
import { uploadFile } from '../s3/upload';
import { sanitizeFileName } from '../utils/file';

/**
 * Sets up the CLI interface
 * @returns Configured Commander instance
 */
export function setupCLI(): Command {
  const program = new Command()
    .name('ff')
    .description(colors.cyan('FilesFly - Fast and beautiful S3 file uploader'))
    .version(packageJson.version);

  // Check command
  program
    .command('check')
    .description('Test S3 connection and configuration')
    .action(async () => {
      await loadConfig();
      const client = createS3Client();
      await checkConnection(client);
    });

  // Upload command (default)
  program
    .command('upload [file]', { isDefault: true })
    .description('Upload a file to S3')
    .option('-o, --output <name>', 'Custom output filename')
    .action(async (file, options) => {
      if (!file) {
        program.help();
        return;
      }
      await loadConfig();
      const client = createS3Client();
      const s3FileName = options.output
        ? sanitizeFileName(options.output)
        : sanitizeFileName(basename(file));
      await uploadFile(client, file, s3FileName);
    });

  // Delete command
  program
    .command('delete [file]')
    .description('Delete a file from S3')
    .action(async file => {
      if (!file) {
        program.help();
        return;
      }
      await loadConfig();
      const client = createS3Client();
      await deleteFile(client, file);
    });

  program.addHelpText(
    'after',
    `
Example usage:
  $ ff check                      # Test S3 connection
  $ ff upload image.jpg           # Upload with original filename
  $ ff upload data.csv -o report  # Upload with custom filename
  $ ff delete image.jpg          # Delete file from S3
  $ ff image.jpg                 # Upload (shorthand)

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

  return program;
}

/**
 * Main CLI handler
 */
export async function handleCLI(): Promise<void> {
  const program = setupCLI();
  program.parse();
}
