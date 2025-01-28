import colors from "ansi-colors";
import { S3Client, type S3File } from "bun";
import cliProgress from "cli-progress";
import { basename } from "path";

// Function to sanitize filename for URL compatibility
function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "-") // Replace any non-alphanumeric chars (except dots) with hyphens
    .replace(/-+/g, "-") // Replace multiple consecutive hyphens with a single one
    .replace(/^-|-$/g, ""); // Remove leading and trailing hyphens
}

// Check if file path is provided
if (process.argv.length < 3) {
  console.error("Please provide a file path to upload");
  console.error("Usage: bun run index.ts <file_path>");
  process.exit(1);
}

const filePath = process.argv[2];

try {
  const file = Bun.file(filePath);
  const exists = await file.exists();
  if (!exists) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
} catch (error: any) {
  console.error(`Error accessing file: ${error.message}`);
  process.exit(1);
}

const endpoint = process.env.ENDPOINT;
const client = new S3Client({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  bucket: process.env.BUCKET,
  region: process.env.REGION,
  endpoint,
});

// Get the filename from the path and sanitize it
const fileName = sanitizeFileName(basename(filePath));
const s3file: S3File = client.file(fileName);

try {
  // Create a writer for streaming
  const writer = s3file.writer({
    retry: 3,
    queueSize: 10,
    partSize: 5 * 1024 * 1024, // 5MB chunks
  });

  // File as buffer
  const file = await Bun.file(filePath);
  const fileSize = await file.size;

  // Create progress bar
  const progressBar = new cliProgress.SingleBar({
    format:
      colors.cyan("{bar}") +
      " | {percentage}% | {value}/{total} bytes | Speed: {speed} MB/s | ETA: {eta}s",
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
    clearOnComplete: true,
  });

  // Initialize the progress bar
  progressBar.start(fileSize, 0);

  let uploadedBytes = 0;
  let startTime = Date.now();

  const stream = file.stream();
  const reader = stream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    writer.write(value);

    // Update progress
    uploadedBytes += value.length;
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const speed = uploadedBytes / (1024 * 1024) / elapsedSeconds; // MB/s

    progressBar.update(uploadedBytes, {
      speed: speed.toFixed(2),
    });
  }
  await writer.end();
  progressBar.stop();

  console.log(colors.green("\n✓ Upload completed successfully!"));
  console.log(`\nFile uploaded as: ${colors.cyan(fileName)}`);
  console.log(
    `File available at: ${colors.blue(
      `https://${s3file.bucket}.${endpoint}/${fileName}`
    )}`
  );
} catch (error: any) {
  console.error(colors.red(`\n✗ Error uploading file: ${error.message}`));
  process.exit(1);
}
