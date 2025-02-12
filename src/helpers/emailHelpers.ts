import nodemailer from 'nodemailer';
import config from '../config';

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
    user: config.node_email,
    pass: config.node_email_password,
  },
});

// CONGRATULATIONS ON ACCOUNT SUCCESSFULLY VERIFICATION
async function congratulateOnAccountCreation({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const info = await transporter.sendMail({
    from: '"Karnival Kookies" <no-reply@karnivalkookies.com>', // Updated sender address
    to: email,
    subject: 'Welcome to the Karnival Kookies Family! 🍪',
    text: `Hello ${name || 'Valued Customer'}, thank you for joining us at karnivalkookies.com!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <p style="font-size: 16px;">Hello ${name || 'Valued Customer'},</p>

        <p style="font-size: 14px; margin-bottom: 20px;">
          🎉 <strong>Congratulations</strong> and welcome to <strong>Karnival Kookies</strong>! We're thrilled to have you as part of our community. Your account has been successfully verified, and you're now ready to explore all the amazing goodies we have to offer.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://karnivalkookies.com/account" 
             style="background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
            Visit Your Account
          </a>
        </div>

        <p style="font-size: 14px;">
          Need help or have questions? Reach out to us at 
          <a href="mailto:karnivalkookies@gmail.com">karnivalkookies@gmail.com</a>.
        </p>

        <p style="font-size: 14px; margin-top: 20px;">
          If you didn’t sign up for this account, please ignore this email or contact our support team.
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

        <p style="font-size: 14px; color: #555;">
          🍪 Dive into our delicious selection of cookies and treats at 
          <a href="https://karnivalkookies.com">karnivalkookies.com</a>.
        </p>

        <p style="font-size: 14px; margin-top: 20px;">Best regards,</p>
        <p style="font-size: 14px; font-weight: bold;">The Karnival Kookies Team</p>
      </div>
    `,
  });

  // Return message info for better logging
  return { success: true, messageId: info.messageId };
}

async function emailVerification({
  name,
  email,
  code,
}: {
  name: string;
  email: string;
  code: string | number;
}) {
  const info = await transporter.sendMail({
    from: '"Karnival Kookies" <no-reply@karnivalkookies.com>', // Updated email address
    to: email,
    subject: 'Verify Your Email at Karnival Kookies!',
    text: `Hello ${name || 'Valued Customer'}, your verification code is: ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <p style="font-size: 16px;">Hello ${name || 'Valued Customer'},</p>

        <p style="font-size: 14px; margin-bottom: 20px;">
          Thank you for registering at <strong>Karnival Kookies</strong>! We're excited to have you on board.
          Please use the code below to verify your account:
        </p>

        <h1 style="background-color: #007bff; color: #fff; padding: 15px; border-radius: 5px; text-align: center; font-size: 32px;">${code}</h1>

        <p style="font-size: 14px; margin-top: 20px;">
          If you didn’t request this verification, please ignore this email.
        </p>

        <p style="font-size: 14px;">
          For any questions, contact us at <a href="mailto:karnivalkookies@gmail.com">karnivalkookies@gmail.com</a> or visit 
          <a href="https://karnivalkookies.com">karnivalkookies.com</a>.
        </p>

        <p style="font-size: 14px;">Best regards,</p>
        <p style="font-size: 14px; font-weight: bold;">The Karnival Kookies Team</p>
      </div>
    `,
  });

  // Return message ID for logging or confirmation
  return { success: true, messageId: info.messageId };
}

//   RESET PASSWORD CODE
async function resetPasswordCode(
  name: string,
  email: string,
  code: string | number,
) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Karnival Kookies" <karnivalkookies.com>', // sender address
    to: email, // list of receivers
    subject: 'Reset your password at karnivalkookies.com!', // Subject line
    text: 'Reset Password', // plain text body
    html: `
      <p>Hello ${name}, </p>

      <div style="margin: 20px 0; ">
        <p style="margin: 0;">Thank you for using karnivalkookies.com. We're excited to have you on board! </p>
        <p style="margin: 0;">Please enter the code below on the verification page to reset your password.</p>
      </div>

      <h1 style="background-color: #007bff; color: #fff; padding: 10px; border-radius: 5px; text-align: center;">${code}</h1>

      <div style="margin: 20px 0; ">
        <p style="margin: 0;">If you have any questions, feel free to reach out to us at karnivalkookies@gmail.com.</p>
        <p style="margin: 0;">Visit our website at <a href="https://karnivalkookies.com">karnivalkookies.com</a></a> for more details.</p>
      </div>

      <div>
        <h4 style="margin: 0;">Best regards,</h4>
        <p style="margin: 0;">karnivalkookies.com</p>
      </div>
      `, // html body
  });
  return info;
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

// ORDER CONFORMATION MAIL
async function orderConfirmationMail(
  name: string,
  email: string,
  orderId: string | number,
) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Karnival Kookies" <karnivalkookies@gmail.com>', // ensure you're using a valid email
    to: email,
    subject: 'Order Confirmation - Karnival Kookies',
    text: 'Thank you for your order at Karnival Kookies!',
    html: `
        <p>Hello ${name}, </p>

        <div style="margin: 20px 0;">
          <p style="margin: 0;">Thank you for your recent order at Karnival Kookies! We're thrilled to bake some delicious treats for you.</p>
          <p style="margin: 0;">Your order ID is <strong>${orderId}</strong>.</p>
          <p style="margin: 0;">Here are the details of your order:</p>
        </div>


        <div style="margin: 20px 0;">
          <p style="margin: 0;">If you have any questions about your order, feel free to reach out to us at karnivalkookies@gmail.com.</p>
          <p style="margin: 0;">Visit our website at <a href="https://karnivalkookies.com">karnivalkookies.com</a> for more updates.</p>
        </div>

        <div>
          <h4 style="margin: 0;">Best regards,</h4>
          <p style="margin: 0;">Karnival Kookies Team</p>
        </div>
    `,
  });
  return info;
}

// Function to send email
async function sendNewsletter(email: string, subject: string, content: string) {
  try {
    const info = await transporter.sendMail({
      from: '"Karnival Kookies" <your-email@example.com>',
      to: email,
      subject: subject || 'Weekly Update',
      html: content || `<p>Your content here</p>`,
    });
    console.log('Newsletter sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending newsletter: ', error);
  }
}

export const EmailHelpers = {
  resetPasswordCode,
  emailVerification,
  congratulateOnAccountCreation,
  orderConfirmationMail,
  sendNewsletter,
};
