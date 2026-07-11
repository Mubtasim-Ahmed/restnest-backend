const axios = require('axios');
const { PAYMENT_STATUS } = require('../config/constants');

const API_URL = process.env.SSLCOMMERZ_API_URL || 'https://sandbox.sslcommerz.com';

// Initialize payment session
const initPaymentSession = async (paymentData) => {
  try {
    const {
      storeId = process.env.SSLCOMMERZ_STORE_ID,
      storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD,
      totalAmount,
      currency = 'BDT',
      transactionId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      productName,
      productCategory = 'RentNest',
      successUrl,
      failUrl,
      cancelUrl
    } = paymentData;

    const payload = {
      store_id: storeId,
      store_passwd: storePassword,
      total_amount: totalAmount,
      currency,
      tran_id: transactionId,
      cus_name: customerName,
      cus_email: customerEmail,
      cus_phone: customerPhone,
      cus_add1: customerAddress,
      product_name: productName,
      product_category: productCategory,
      success_url: successUrl,
      fail_url: failUrl,
      cancel_url: cancelUrl
    };

    const response = await axios.post(`${API_URL}/gwprocess/v4/api.php`, payload);

    if (response.data.status === 'SUCCESS') {
      return {
        success: true,
        sessionId: response.data.sessionkey,
        redirectUrl: response.data.redirectGatewayURL,
        data: response.data
      };
    }

    return {
      success: false,
      error: response.data.failedreason || 'Failed to initialize payment session'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Validate payment
const validatePayment = async (validationData) => {
  try {
    const { transactionId, amount, currency = 'BDT' } = validationData;

    const payload = {
      store_id: process.env.SSLCOMMERZ_STORE_ID,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
      tran_id: transactionId
    };

    const response = await axios.post(`${API_URL}/validator/api/validationApi.php`, payload);

    if (response.data.status === 'VALID') {
      return {
        success: true,
        transactionId: response.data.tran_id,
        amount: response.data.amount,
        status: PAYMENT_STATUS.COMPLETED,
        validationStatus: response.data.status
      };
    }

    return {
      success: false,
      status: PAYMENT_STATUS.FAILED,
      error: response.data.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: PAYMENT_STATUS.FAILED
    };
  }
};

// Parse IPN (Instant Payment Notification)
const parseIPN = (data) => {
  return {
    transactionId: data.tran_id,
    status: data.status,
    amount: parseFloat(data.amount),
    currency: data.currency,
    validationId: data.val_id,
    customerName: data.cus_name,
    customerEmail: data.cus_email,
    cardType: data.card_type,
    cardNo: data.card_no,
    risklevel: data.risk_level
  };
};

module.exports = {
  initPaymentSession,
  validatePayment,
  parseIPN
};
