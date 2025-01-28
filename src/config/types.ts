export interface S3Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
}

export interface UploadOptions {
  retry: number;
  queueSize: number;
  partSize: number;
}

export const REQUIRED_ENV_VARS = [
  "ENDPOINT",
  "ACCESS_KEY_ID",
  "SECRET_ACCESS_KEY",
  "BUCKET",
  "REGION",
] as const;

export const DEFAULT_UPLOAD_OPTIONS: UploadOptions = {
  retry: 3,
  queueSize: 10,
  partSize: 5 * 1024 * 1024, // 5MB chunks
};
