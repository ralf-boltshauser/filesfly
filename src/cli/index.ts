import colors from 'ansi-colors';
import { Command } from 'commander';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import packageJson from '../../package.json';
import { loadConfig } from '../config';
import { checkConnection, createS3Client } from '../s3/client';
import { deleteFile } from '../s3/delete';
import { downloadFile } from '../s3/download';
import { uploadFile } from '../s3/upload';
import { sanitizeFileName } from '../utils/file';
import { confirm } from '../utils/prompt';

interface UploadSummary {
  path: string;
  s3Key: string;
  size: number;
}

function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function printUploadSummary(uploads: UploadSummary[]): void {
  const totalSize = uploads.reduce((sum, file) => sum + file.size, 0);

  console.log(colors.cyan('\n📊 Upload Summary'));
  console.log('─'.repeat(100));

  // Print each file with its details
  uploads.forEach((file, index) => {
    console.log(
      colors.gray(`${(index + 1).toString().padStart(3)}.`) +
        ` ${colors.green('✓')} ${file.path.padEnd(50)} ` +
        colors.blue(`${formatFileSize(file.size).padStart(10)}`) +
        colors.gray(` → ${file.s3Key}`)
    );
  });

  console.log('─'.repeat(100));
  console.log(
    colors.yellow(`Total: ${uploads.length} files uploaded, `) +
      colors.blue(`${formatFileSize(totalSize)} transferred\n`)
  );
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function* walkDirectory(dir: string): AsyncGenerator<string> {
  const files = await readdir(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    if (await isDirectory(fullPath)) {
      yield* walkDirectory(fullPath);
    } else {
      yield fullPath;
    }
  }
}

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
    .description('Upload a file or folder to S3')
    .option('-o, --output <n>', 'Custom output filename (only for single files)')
    .action(async (file, options) => {
      if (!file) {
        program.help();
        return;
      }

      await loadConfig();
      const client = createS3Client();

      if (await isDirectory(file)) {
        console.log(colors.yellow(`📁 "${file}" is a directory.`));
        const confirmed = await confirm(
          'Are you sure you want to upload all files in this directory recursively?'
        );

        if (!confirmed) {
          console.log(colors.yellow('Upload cancelled.'));
          return;
        }

        console.log(colors.cyan('🔍 Scanning directory...'));
        const uploadSummary: UploadSummary[] = [];

        for await (const filePath of walkDirectory(file)) {
          const s3FileName = sanitizeFileName(filePath);
          await uploadFile(client, filePath, s3FileName);

          const fileStats = await stat(filePath);
          uploadSummary.push({
            path: filePath,
            s3Key: s3FileName,
            size: fileStats.size,
          });
        }

        printUploadSummary(uploadSummary);
      } else {
        const s3FileName = options.output
          ? sanitizeFileName(options.output)
          : sanitizeFileName(file);
        await uploadFile(client, file, s3FileName);
      }
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

  // Download command
  program
    .command('download <file>')
    .description('Download a file from S3')
    .option('-o, --output <path>', 'Custom output path for the downloaded file')
    .action(async (file: string, options) => {
      await loadConfig();
      const client = createS3Client();

      const outputPath = options.output || file;
      console.log(colors.cyan(`📥 Downloading ${colors.bold(file)}...`));

      await downloadFile(client, file, outputPath);
    });

  program.addHelpText(
    'after',
    `
Example usage:
  $ ff check                      # Test S3 connection
  $ ff upload image.jpg           # Upload with original filename
  $ ff upload data.csv -o report  # Upload with custom filename
  $ ff download image.jpg         # Download with original filename
  $ ff download data.csv -o local.csv  # Download with custom filename
  $ ff delete image.jpg          # Delete file from S3
  $ ff image.jpg                 # Upload (shorthand)

Configuration:
  Create a config file at ~/.config/filesfly/filesfly.json:
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
