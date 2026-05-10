import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { OrderModel } from '@fastcopy/database';
import { env } from '../config/env';

const s3 = new S3Client({ region: env.AWS_REGION });

export async function deleteExpiredDeliveredFiles() {
  const orders = await OrderModel.find({ status: 'delivered', 'file.deleteAfter': { $lte: new Date() }, 'file.s3Key': { $exists: true } }).limit(100);
  await Promise.all(orders.map(async order => {
    await s3.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: order.file.s3Key }));
    order.file.s3Key = `deleted:${order.id}`;
    await order.save();
  }));
  return { deleted: orders.length };
}
