const { prisma } = require('../config/database');
const { PAYMENT_STATUS, PAYMENT_METHODS, RENTAL_STATUS } = require('../config/constants');
const stripeService = require('../utils/stripeService');
const sslcommerzService = require('../utils/sslcommerzService');

const createStripePaymentIntent = async (req, res, next) => {
  try {
    const { rentalRequestId } = req.body;

    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id: rentalRequestId }
    });

    if (!rentalRequest) {
      return res.status(404).json({
        success: false,
        message: 'Rental request not found'
      });
    }

    if (rentalRequest.tenantId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to make payment for this rental'
      });
    }

    if (rentalRequest.status !== RENTAL_STATUS.APPROVED) {
      return res.status(400).json({
        success: false,
        message: 'This rental request has not been approved yet'
      });
    }

    const totalAmount = rentalRequest.monthlyRent + rentalRequest.securityDeposit;

    const stripeResult = await stripeService.createPaymentIntent(totalAmount, 'usd', {
      rentalRequestId,
      tenantId: req.userId,
      propertyId: rentalRequest.propertyId
    });

    if (!stripeResult.success) {
      return res.status(400).json({
        success: false,
        message: stripeResult.error
      });
    }

    const payment = await prisma.payment.create({
      data: {
        rentalRequestId,
        tenantId: req.userId,
        landlordId: rentalRequest.landlordId,
        propertyId: rentalRequest.propertyId,
        amount: totalAmount,
        currency: 'USD',
        method: PAYMENT_METHODS.STRIPE,
        provider: 'stripe',
        status: PAYMENT_STATUS.PENDING,
        stripePaymentIntentId: stripeResult.paymentIntentId,
        description: `Payment for rental request ${rentalRequestId}`
      }
    });

    await prisma.rentalRequest.update({
      where: { id: rentalRequestId },
      data: {
        paymentMethod: 'stripe',
        paymentId: payment.id,
        status: RENTAL_STATUS.PAYMENT_PENDING
      }
    });

    res.status(200).json({
      success: true,
      message: 'Payment intent created successfully',
      data: {
        paymentId: payment.id,
        clientSecret: stripeResult.clientSecret,
        amount: totalAmount,
        currency: 'USD'
      }
    });
  } catch (error) {
    next(error);
  }
};

const initiateSslcommerzPayment = async (req, res, next) => {
  try {
    const { rentalRequestId } = req.body;

    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id: rentalRequestId }
    });

    if (!rentalRequest) {
      return res.status(404).json({
        success: false,
        message: 'Rental request not found'
      });
    }

    if (rentalRequest.tenantId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to make payment for this rental'
      });
    }

    if (rentalRequest.status !== RENTAL_STATUS.APPROVED) {
      return res.status(400).json({
        success: false,
        message: 'This rental request has not been approved yet'
      });
    }

    const totalAmount = rentalRequest.monthlyRent + rentalRequest.securityDeposit;
    const transactionId = `RENTNEST_${rentalRequestId}_${Date.now()}`;

    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    const paymentData = {
      totalAmount,
      currency: 'BDT',
      transactionId,
      customerName: `${user.firstName} ${user.lastName}`,
      customerEmail: user.email,
      customerPhone: user.phone,
      customerAddress: user.address,
      productName: `Rent Payment - Property ID: ${rentalRequest.propertyId}`,
      productCategory: 'RentNest',
      successUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
      failUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/fail`,
      cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`
    };

    const result = await sslcommerzService.initPaymentSession(paymentData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    const payment = await prisma.payment.create({
      data: {
        rentalRequestId,
        tenantId: req.userId,
        landlordId: rentalRequest.landlordId,
        propertyId: rentalRequest.propertyId,
        amount: totalAmount,
        currency: 'BDT',
        method: PAYMENT_METHODS.SSLCOMMERZ,
        provider: 'sslcommerz',
        status: PAYMENT_STATUS.PENDING,
        sslcommerzSessionId: result.sessionId,
        transactionId,
        description: `Payment for rental request ${rentalRequestId}`
      }
    });

    await prisma.rentalRequest.update({
      where: { id: rentalRequestId },
      data: {
        paymentMethod: 'sslcommerz',
        paymentId: payment.id,
        status: RENTAL_STATUS.PAYMENT_PENDING
      }
    });

    res.status(200).json({
      success: true,
      message: 'Payment session initiated successfully',
      data: {
        paymentId: payment.id,
        redirectUrl: result.redirectUrl,
        amount: totalAmount,
        currency: 'BDT'
      }
    });
  } catch (error) {
    next(error);
  }
};

const verifyStripePayment = async (req, res, next) => {
  try {
    const { paymentIntentId, paymentId } = req.body;

    const stripeResult = await stripeService.retrievePaymentIntent(paymentIntentId);

    if (!stripeResult.success) {
      return res.status(400).json({
        success: false,
        message: stripeResult.error
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        rentalRequest: true
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (stripeResult.status === 'succeeded') {
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PAYMENT_STATUS.COMPLETED,
          paidAt: new Date(),
          transactionId: paymentIntentId
        }
      });

      await prisma.rentalRequest.update({
        where: { id: payment.rentalRequestId },
        data: {
          status: RENTAL_STATUS.ACTIVE,
          rentalStartDate: payment.rentalRequest?.moveInDate,
          rentalEndDate: payment.rentalRequest?.moveOutDate
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: updatedPayment
      });
    }

    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: PAYMENT_STATUS.FAILED }
    });

    res.status(400).json({
      success: false,
      message: 'Payment not completed'
    });
  } catch (error) {
    next(error);
  }
};

const handleSslcommerzIPN = async (req, res, next) => {
  try {
    const ipnData = sslcommerzService.parseIPN(req.body);

    const payment = await prisma.payment.findUnique({
      where: { transactionId: ipnData.transactionId },
      include: {
        rentalRequest: true
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (ipnData.status === 'VALID' || ipnData.status === 'VALIDATED') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PAYMENT_STATUS.COMPLETED,
          paidAt: new Date(),
          metadata: ipnData
        }
      });

      await prisma.rentalRequest.update({
        where: { id: payment.rentalRequestId },
        data: {
          status: RENTAL_STATUS.ACTIVE,
          rentalStartDate: payment.rentalRequest?.moveInDate,
          rentalEndDate: payment.rentalRequest?.moveOutDate
        }
      });
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PAYMENT_STATUS.FAILED }
      });
    }

    res.status(200).json({
      success: true,
      message: 'IPN processed successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getUserPaymentHistory = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { tenantId: req.userId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const payments = await prisma.payment.findMany({
      where: filter,
      include: {
        rentalRequest: {
          select: {
            moveInDate: true,
            moveOutDate: true,
            monthlyRent: true,
            securityDeposit: true
          }
        },
        property: {
          select: {
            title: true,
            address: true,
            city: true,
            country: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.payment.count({ where: filter });

    res.status(200).json({
      success: true,
      message: 'Payment history fetched successfully',
      data: payments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentDetails = async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        landlord: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        property: {
          select: {
            title: true,
            address: true,
            city: true,
            country: true
          }
        },
        rentalRequest: true
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const isAuthorized =
      payment.tenantId === req.userId ||
      payment.landlordId === req.userId;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this payment'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStripePaymentIntent,
  initiateSslcommerzPayment,
  verifyStripePayment,
  handleSslcommerzIPN,
  getUserPaymentHistory,
  getPaymentDetails
};
