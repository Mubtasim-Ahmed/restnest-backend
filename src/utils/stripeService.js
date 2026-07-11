const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PAYMENT_STATUS } = require('../config/constants');

// Create a payment intent
const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata
    });

    return {
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount / 100
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Retrieve payment intent
const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Create refund
const createRefund = async (paymentIntentId, amount = null, reason = 'requested_by_customer') => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason
    });

    return {
      success: true,
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Handle webhook events
const handleWebhookEvent = async (event) => {
  switch (event.type) {
    case 'payment_intent.succeeded':
      return {
        eventType: 'payment_success',
        paymentIntentId: event.data.object.id,
        status: PAYMENT_STATUS.COMPLETED
      };

    case 'payment_intent.payment_failed':
      return {
        eventType: 'payment_failed',
        paymentIntentId: event.data.object.id,
        status: PAYMENT_STATUS.FAILED,
        failureMessage: event.data.object.last_payment_error?.message
      };

    case 'charge.refunded':
      return {
        eventType: 'payment_refunded',
        chargeId: event.data.object.id,
        refundedAmount: event.data.object.amount_refunded / 100
      };

    default:
      return null;
  }
};

module.exports = {
  createPaymentIntent,
  retrievePaymentIntent,
  createRefund,
  handleWebhookEvent
};
