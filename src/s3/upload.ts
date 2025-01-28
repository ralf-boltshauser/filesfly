import colors from 'ansi-colors';
import type { S3Client } from 'bun';
import { DEFAULT_UPLOAD_OPTIONS, type UploadOptions } from '../config/types';
import { streamWithProgress } from '../utils/progress';

/**
 * Uploads a file to S3 with progress bar
 * @param client S3 client
 * @param localPath Local file path
 * @param s3FileName Target filename in S3
 * @param options Upload options
 */
export async function uploadFile(
  client: S3Client,
  localPath: string,
  s3FileName: string,
  options: UploadOptions = DEFAULT_UPLOAD_OPTIONS
): Promise<void> {
  try {
    const file = Bun.file(localPath);
    if (!(await file.exists())) {
      console.error(colors.red(`File not found: ${localPath}`));
      process.exit(1);
    }

    const s3file = client.file(s3FileName);
    const writer = s3file.writer(options);
    const fileSize = await file.size;

    await streamWithProgress(file, writer, fileSize);

    console.log(colors.green('\n✓ Upload completed successfully!'));
    console.log(`\nFile uploaded as: ${colors.cyan(s3FileName)}`);
    console.log(
      `File available at: ${colors.blue(
        `https://${s3file.bucket}.${process.env.ENDPOINT}/${s3FileName}`
      )}`
    );
  } catch (error: any) {
    console.error(colors.red(`\n✗ Error uploading file: ${error.message}`));
    process.exit(1);
  }
}
