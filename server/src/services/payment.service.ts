import { ENV } from '../config/env.js';

export interface PaymentPlan {
  id: string;
  name: string;
  duration: string;
  priceINR: number;
  features: string[];
}

export const AD_PLANS: PaymentPlan[] = [
  {
    id: 'PLAN_1_WEEK',
    name: '1 Week Quick Ad',
    duration: 'WEEK_1',
    priceINR: 499,
    features: ['1 Week Public Listing', 'Basic Search Visibility', 'Standard Support'],
  },
  {
    id: 'PLAN_1_MONTH',
    name: '1 Month Standard',
    duration: 'MONTH_1',
    priceINR: 1499,
    features: ['30 Days Visibility', 'Featured Badge', 'SMS/WhatsApp Lead Alerts', 'Real-time Analytics'],
  },
  {
    id: 'PLAN_3_MONTHS',
    name: '3 Months Value Pack',
    duration: 'MONTH_3',
    priceINR: 3499,
    features: ['90 Days Visibility', 'Top Search Placement', 'Priority Verification', 'Dedicated Lead Manager'],
  },
  {
    id: 'PLAN_6_MONTHS',
    name: '6 Months Pro Pack',
    duration: 'MONTH_6',
    priceINR: 5999,
    features: ['180 Days Active Listing', 'Homepage Carousel Slot', 'CRM Pipeline Access', 'Unlimited Inquiries'],
  },
  {
    id: 'PLAN_1_YEAR',
    name: '1 Year Annual Enterprise',
    duration: 'YEAR_1',
    priceINR: 9999,
    features: ['365 Days Active Listing', 'Maximum Reach & Boost', 'Verified Broker Profile', 'Full CRM & Analytics'],
  },
];

export class PaymentService {
  /**
   * Check whether a real payment gateway has been configured in environment variables.
   */
  static isConfigured(): boolean {
    return Boolean(ENV.RAZORPAY_KEY_ID && ENV.RAZORPAY_KEY_SECRET);
  }

  static getProviderName(): string {
    if (ENV.RAZORPAY_KEY_ID) return 'Razorpay';
    return 'None (Future Payment Architecture Ready)';
  }

  static getPlans(): PaymentPlan[] {
    return AD_PLANS;
  }

  /**
   * Order creation - respects requirement 17:
   * "Future payment functionality must remain disabled until a real payment provider is configured."
   */
  static async createOrder(planId: string, propertyId: string, userId: string) {
    if (!this.isConfigured()) {
      return {
        configured: false,
        message: 'Payment gateway is currently not configured by the system administrator. Properties can be submitted for review without upfront payment.',
        plan: AD_PLANS.find(p => p.id === planId) || null,
      };
    }

    // When configured with real Razorpay credentials:
    // const instance = new Razorpay({ key_id: ENV.RAZORPAY_KEY_ID, key_secret: ENV.RAZORPAY_KEY_SECRET });
    // const order = await instance.orders.create({ amount: plan.priceINR * 100, currency: 'INR', receipt: `prop_${propertyId}` });
    return {
      configured: true,
      orderId: `order_sample_${Date.now()}`,
      propertyId,
      userId,
    };
  }
}
