import { S3Client } from "bun";
import { validateEnvironmentVars } from "../config";

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
