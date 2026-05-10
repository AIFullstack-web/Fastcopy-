import { OrderModel } from './models/order.model';
import { PaymentModel } from './models/payment.model';

export const analyticsPipelines = {
  dailyRevenue(days = 30) {
    return PaymentModel.aggregate([
      { $match: { status: 'captured', createdAt: { $gte: new Date(Date.now() - days * 86400000) } } },
      { $group: { _id: { $dateTrunc: { date: '$createdAt', unit: 'day' } }, revenue: { $sum: '$amount' }, commission: { $sum: '$commissionAmount' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
  },
  vendorPerformance() {
    return OrderModel.aggregate([
      { $match: { status: { $in: ['delivered', 'cancelled'] } } },
      { $group: { _id: '$vendorId', delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } }, cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }, avgValue: { $avg: '$pricing.total' } } },
      { $sort: { delivered: -1 } }
    ]);
  }
};
