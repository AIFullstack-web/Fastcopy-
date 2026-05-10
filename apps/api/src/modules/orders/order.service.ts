import { calculatePrintQuote, type CreateOrderInput, type QuoteRequest } from '@fastcopy/shared';
import { OrderModel, VendorModel } from '@fastcopy/database';
import { nanoid } from 'nanoid';

export class OrderService {
  async quote(input: QuoteRequest) {
    const vendor = await VendorModel.findOne({ _id: input.vendorId, approvalStatus: 'approved', deletedAt: null }).lean();
    if (!vendor) throw Object.assign(new Error('Vendor not available'), { statusCode: 404 });
    return calculatePrintQuote(input, vendor.rateCard);
  }

  async create(customerId: string, input: CreateOrderInput) {
    const pricing = await this.quote(input);
    const deleteAfter = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return OrderModel.create({
      orderNumber: `FC-${nanoid(10).toUpperCase()}`,
      customerId,
      vendorId: input.vendorId,
      file: {
        s3Key: input.fileId,
        originalName: 'encrypted-upload.pdf',
        sha256: input.fileId,
        mimeType: 'application/pdf',
        sizeBytes: 0,
        pageCount: input.options.pageCount,
        encrypted: true,
        deleteAfter
      },
      printOptions: input.options,
      fulfillmentMode: input.fulfillmentMode,
      deliveryLocation: input.deliveryLocation,
      pricing,
      statusHistory: [{ status: 'new', actorId: customerId, note: 'Order created' }],
      payment: { provider: input.paymentProvider, status: 'authorized' },
      customerNotes: input.customerNotes
    });
  }

  async transition(orderId: string, vendorOwnerId: string, status: string, note?: string) {
    const vendor = await VendorModel.findOne({ ownerId: vendorOwnerId }).select('_id').lean();
    if (!vendor) throw Object.assign(new Error('Vendor profile not found'), { statusCode: 404 });
    const order = await OrderModel.findOneAndUpdate(
      { _id: orderId, vendorId: vendor._id },
      { $set: { status, ...(status === 'delivered' ? { deliveredAt: new Date() } : {}) }, $push: { statusHistory: { status, actorId: vendorOwnerId, note } } },
      { new: true }
    );
    if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    return order;
  }
}
