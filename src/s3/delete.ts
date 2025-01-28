import colors from "ansi-colors";
import type { S3Client } from "bun";
import { confirm } from "../utils/prompt";

/**
 * Deletes a file from S3 with confirmation
 * @param client S3 client
 * @param filePath Path of the file to delete
 */
export async function deleteFile(
  client: S3Client,
  filePath: string
): Promise<void> {
  const s3file = client.file(filePath);

  try {
    if (!(await s3file.exists())) {
      console.error(colors.red(`File not found in S3: ${filePath}`));
      process.exit(1);
    }

    const confirmed = await confirm(
      colors.yellow(`Are you sure you want to delete '${filePath}' from S3?`)
    );

    if (!confirmed) {
      console.log(colors.yellow("Deletion cancelled"));
      process.exit(0);
    }

    await s3file.delete();
    console.log(colors.green(`\n✓ Successfully deleted: ${filePath}`));
  } catch (error: any) {
    console.error(colors.red(`\n✗ Error deleting file: ${error.message}`));
    process.exit(1);
  }
}
