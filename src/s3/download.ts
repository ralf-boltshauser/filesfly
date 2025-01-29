import colors from 'ansi-colors';
import type { S3Client } from 'bun';
import cliProgress from 'cli-progress';

/**
 * Downloads a file from S3 with progress bar
 * @param client S3 client
 * @param s3FileName File name in S3 to download
 * @param localPath Local path to save the file to
 */
export async function downloadFile(
  client: S3Client,
  s3FileName: string,
  localPath: string
): Promise<void> {
  try {
    const s3file = client.file(s3FileName);
    if (!(await s3file.exists())) {
      console.error(colors.red(`File not found in S3: ${s3FileName}`));
      process.exit(1);
    }

    const file = Bun.file(localPath);
    const writer = file.writer();
    const fileSize = await s3file.size;

    console.log(colors.cyan('📥 Starting download...'));
    console.log('');

    const progressBar = new cliProgress.SingleBar({
      format:
        colors.cyan('{bar}') +
        ' | {percentage}% | {value}/{total} bytes | Speed: {speed} MB/s | ETA: {eta}s',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
      clearOnComplete: false,
    });

    progressBar.start(fileSize, 0);

    let downloadedBytes = 0;
    const startTime = Date.now();

    const stream = s3file.stream();
    const reader = stream.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      writer.write(value);
      downloadedBytes += value.length;

      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const speed = downloadedBytes / (1024 * 1024) / elapsedSeconds;

      progressBar.update(downloadedBytes, {
        speed: speed.toFixed(2),
      });
    }

    progressBar.stop();
    writer.end();

    console.log(colors.green('\n✓ Download completed successfully!'));
    console.log(`\nFile downloaded to: ${colors.cyan(localPath)}`);
    console.log(
      `File downloaded from: ${colors.blue(
        `https://${s3file.bucket}.${process.env.ENDPOINT}/${s3FileName}`
      )}`
    );
  } catch (error: any) {
    console.error(colors.red(`\n✗ Error downloading file: ${error.message}`));
    process.exit(1);
  }
}
