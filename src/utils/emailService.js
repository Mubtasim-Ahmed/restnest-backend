const nodemailer = require('nodemailer');

// Email service configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send welcome email
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to RentNest 🏠',
      html: `
        <h1>Welcome to RentNest!</h1>
        <p>Dear ${firstName},</p>
        <p>Thank you for registering on RentNest. We're excited to have you on our platform!</p>
        <p>You can now browse properties, submit rental requests, and connect with landlords.</p>
        <p>Happy renting!</p>
        <p>Best regards,<br/>RentNest Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Send rental request notification
const sendRentalRequestNotification = async (landlordEmail, landlordName, tenantName, propertyTitle) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: landlordEmail,
      subject: 'New Rental Request - RentNest',
      html: `
        <h2>New Rental Request</h2>
        <p>Dear ${landlordName},</p>
        <p>${tenantName} has submitted a rental request for your property: ${propertyTitle}</p>
        <p>Please review and approve or reject the request in your dashboard.</p>
        <p>Best regards,<br/>RentNest Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Send payment confirmation email
const sendPaymentConfirmationEmail = async (email, name, amount, currency, transactionId) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Payment Confirmation - RentNest',
      html: `
        <h2>Payment Confirmation</h2>
        <p>Dear ${name},</p>
        <p>Your payment has been successfully processed.</p>
        <p><strong>Amount:</strong> ${amount} ${currency}</p>
        <p><strong>Transaction ID:</strong> ${transactionId}</p>
        <p>Thank you for using RentNest!</p>
        <p>Best regards,<br/>RentNest Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendRentalRequestNotification,
  sendPaymentConfirmationEmail
};
