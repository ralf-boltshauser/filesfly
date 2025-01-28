import colors from 'ansi-colors';
import type { BunFile } from 'bun';
import cliProgress from 'cli-progress';

/**
 * Streams a file with progress bar
 * @param file File to stream
 * @param writer Writer to write to
 * @param fileSize Size of the file
 */
export async function streamWithProgress(
  file: BunFile,
  writer: any,
  fileSize: number
): Promise<void> {
  const progressBar = new cliProgress.SingleBar({
    format:
      colors.cyan('{bar}') +
      ' | {percentage}% | {value}/{total} bytes | Speed: {speed} MB/s | ETA: {eta}s',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
    clearOnComplete: true,
  });

  progressBar.start(fileSize, 0);

  let uploadedBytes = 0;
  const startTime = Date.now();

  const stream = file.stream();
  const reader = stream.getReader();

  let result;
  do {
    result = await reader.read();
    if (!result.done) {
      writer.write(result.value);

      uploadedBytes += result.value.length;
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const speed = uploadedBytes / (1024 * 1024) / elapsedSeconds;

      progressBar.update(uploadedBytes, {
        speed: speed.toFixed(2),
      });
    }
  } while (!result.done);

  await writer.end();
  progressBar.stop();
}
