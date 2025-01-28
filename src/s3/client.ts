import colors from 'ansi-colors';
import { S3Client } from 'bun';
import { validateEnvironmentVars } from '../config';

/**
 * Creates an S3 client with the current configuration
 * @returns Configured S3 client
 */
export function createS3Client(): S3Client {
  validateEnvironmentVars();
  return new S3Client({
    endpoint: process.env.ENDPOINT!,
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    bucket: process.env.BUCKET!,
    region: process.env.REGION!,
  });
}

/**
 * Tests the S3 connection and configuration
 * @param client S3 client to test
 * @returns Promise that resolves when the check is complete
 */
export async function checkConnection(client: S3Client): Promise<void> {
  try {
    // Try to list objects (with a limit of 1) to test connection
    const testFile = client.file('.filesfly-test');
    await testFile.exists();

    console.log(colors.green('\n✓ S3 connection successful!'));
    console.log(colors.blue('\nConfiguration:'));
    console.log(`  Endpoint: ${colors.cyan(process.env.ENDPOINT!)}`);
    console.log(`  Bucket:   ${colors.cyan(process.env.BUCKET!)}`);
    console.log(`  Region:   ${colors.cyan(process.env.REGION!)}`);
  } catch (error: any) {
    console.error(colors.red('\n✗ S3 connection failed!'));
    console.error(colors.yellow('\nError details:'));
    console.error(`  ${error.message}`);
    console.error(colors.blue('\nCurrent configuration:'));
    console.error(`  Endpoint: ${colors.cyan(process.env.ENDPOINT!)}`);
    console.error(`  Bucket:   ${colors.cyan(process.env.BUCKET!)}`);
    console.error(`  Region:   ${colors.cyan(process.env.REGION!)}`);
    process.exit(1);
  }
}
