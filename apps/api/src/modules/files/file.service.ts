import { PutObjectCommand, S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'node:crypto';
import { env } from '../../config/env';

const s3 = new S3Client({ region: env.AWS_REGION });
export class FileService {
  validatePdfHeader(buffer: Buffer) {
    if (buffer.subarray(0, 5).toString('ascii') !== '%PDF-') throw Object.assign(new Error('Invalid PDF signature'), { statusCode: 422 });
  }

  async createSignedUpload(userId: string, filename: string) {
    if (!filename.toLowerCase().endsWith('.pdf')) throw Object.assign(new Error('Only PDF files are allowed'), { statusCode: 422 });
    const key = `uploads/${userId}/${crypto.randomUUID()}.pdf`;
    const command = new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: key, ContentType: 'application/pdf', ServerSideEncryption: env.S3_KMS_KEY_ID ? 'aws:kms' : 'AES256', SSEKMSKeyId: env.S3_KMS_KEY_ID });
    return { key, uploadUrl: await getSignedUrl(s3, command, { expiresIn: 300 }) };
  }

  async createSignedDownload(key: string) {
    return getSignedUrl(s3, new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }), { expiresIn: 120 });
  }
}
