import nodemailer from 'nodemailer';
import { envConfig } from '../config';
import { logger, errorLogger } from '../shared/logger';

// MESSAGE SENDER CREDENTIAL
// const transporter = nodemailer.createTransport({
//   host: 'karnivalkookies.com',
//   port: 465,
//   secure: true,
//   auth: {
//     user: 'promotions@karnivalkookies.com',
//     pass: 'Rony@142654',
//   },
// });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: envConfig.nodeMailer.node_email,
    pass: envConfig.nodeMailer.node_email_password,
  },
});

const generateNewsletterEmail = (
  userName: string,
  newsletterContent: string,
) => {
  return {
    subject: 'Stay Updated with the Latest from Karnival Kookies!',
    body: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Hi ${userName},</h2>
        <p>We hope you’re doing great! Here’s what’s new and exciting at Karnival Kookies:</p>
        <div>
          <h3>New Kookie Flavors</h3>
          <p>${newsletterContent}</p>
        </div>
        <p>Don’t miss out on our delicious offerings – keep enjoying the best kookies in town!</p>
        <p>Best regards,<br>The Karnival Kookies Team</p>
      </div>
    `,
  };
};

const generateAbandonedCartEmail = (
  userName: string,
  cartItems: any[],
  cartUrl: string,
) => {
  return {
    subject: 'Oops! You Left Something Behind 🛒',
    body: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Hi ${userName},</h2>
        <p>We noticed that you’ve left some delicious kookies in your cart. Don’t miss out on these irresistible treats!</p>
        <h3>Your Cart:</h3>
        <ul>
          ${cartItems.map((item) => `<li>${item.quantity} x ${item.name} - $${item.price}</li>`).join('')}
        </ul>
        <p>Click the button below to complete your purchase:</p>
        <a href="${cartUrl}" style="background-color: #ff6347; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Complete Your Purchase</a>
        <p>We’re holding your kookies for a limited time, so don’t wait!</p>
        <p>Best regards,<br>The Karnival Kookies Team</p>
      </div>
    `,
  };
};

const generateSpecialOfferEmail = (
  userName: string,
  discountCode: string,
  offerDetails: string,
) => {
  return {
    subject: 'Special Offer Just for You! 🎉',
    body: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Hi ${userName},</h2>
        <p>We’re excited to share an exclusive offer just for you!</p>
        <h3>Special Offer: ${offerDetails}</h3>
        <p>Use the code below to get an amazing discount on your next order:</p>
        <p><strong>Discount Code: ${discountCode}</strong></p>
        <p>Hurry! This offer is valid only for a limited time.</p>
        <p>Don’t miss out – order now and enjoy your favorite kookies at a great price!</p>
        <p>Best regards,<br>The Karnival Kookies Team</p>
      </div>
    `,
  };
};

export const sendPromotionalEmail = async (
  email: string,
  type: string,
  userName: string,
  additionalInfo: any,
) => {
  let emailContent;

  switch (type) {
    case 'newsletter':
      emailContent = generateNewsletterEmail(userName, additionalInfo.content);
      break;
    case 'abandoned_cart':
      emailContent = generateAbandonedCartEmail(
        userName,
        additionalInfo.cartItems,
        additionalInfo.cartUrl,
      );
      break;
    case 'special_offer':
      emailContent = generateSpecialOfferEmail(
        userName,
        additionalInfo.discountCode,
        additionalInfo.offerDetails,
      );
      break;
    default:
      emailContent = {
        subject: 'New Update',
        body: 'Here’s the latest update!',
      };
      break;
  }

  try {
    await transporter.sendMail({
      from: '"Karnival Kookies" <orders@karnivalkookies.com>', // Replace with your sender email
      to: email,
      subject: emailContent.subject,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${emailContent.body}</div>`,
    });

    logger.info(`${type} email sent to ${email}`);
  } catch (error) {
    errorLogger.error(error, 'Failed to send email:');
  }
};
