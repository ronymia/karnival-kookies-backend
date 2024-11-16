import nodemailer from 'nodemailer';
import config from '../config';

// MESSAGE SENDER CREDENTIAL
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.node_email,
    pass: config.node_email_password,
  },
});

// CONGRATULATIONS ON ACCOUNT SUCCESSFULLY VERIFICATION
async function congratulateOnAccountCreation(name: string, email: string) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Karnival Kookies" <karnivalkookies.com>', // sender address
    to: email, // list of receivers
    subject: 'Welcome to our community!', // Subject line
    text: 'Thank You for registering at karnivalkookies.com!', // plain text body
    html: `
        <p>Hello ${name},</p>

  <div style="margin: 20px 0;">
    <p style="margin: 0;">Congratulations and welcome to karnivalkookies.com!</p>
    <p style="margin: 0;">We're thrilled to have you as part of our community. Your account has been successfully verified, and you're now ready to explore all the amazing goodies we have to offer.</p>
  </div>

  <div style="margin: 20px 0;">
    <p style="margin: 0;">To get started, visit your account and discover our delicious selection of cookies and treats.</p>
    <p style="margin: 0;">If you have any questions or need assistance, don't hesitate to reach out to us at <a href="mailto:karnivalkookies@gmail.com">karnivalkookies@gmail.com</a>.</p>
  </div>

  <div style="margin: 20px 0;">
    <p style="margin: 0;">Once again, welcome aboard! We're excited to serve you the best cookies in town.</p>
    <p style="margin: 0;">Visit our website at <a href="https://karnivalkookies.com">karnivalkookies.com</a> for more details.</p>
  </div>

  <div>
    <h4 style="margin: 0;">Best regards,</h4>
    <p style="margin: 0;">The karnivalkookies Team</p>
  </div>
        `, // html body
  });
  return info;
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

async function verifyUserMail(
  name: string,
  email: string,
  code: string | number,
) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Karnival Kookies" <karnivalkookies.com>',
    to: email,
    subject: 'Verify yourself at karnivalkookies.com!',
    text: 'Is it really you?',
    html: `
        <p>Hello ${name}, </p>

        <div style="margin: 20px 0; ">
          <p style="margin: 0;">Thank you for registering at karnivalkookies.com. We're excited to have you on board! </p>
          <p style="margin: 0;">Please enter the code below on the verification page to activate your account.</p>
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
        `,
  });
  return info;
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

export const EmailHelpers = {
  resetPasswordCode,
  verifyUserMail,
  congratulateOnAccountCreation,
  orderConfirmationMail,
};
