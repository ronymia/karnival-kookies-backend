import nodemailer from 'nodemailer';
import { envConfig } from '../config';

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

const generateEmailContent = (status: string, order: any) => {
  const templates: Record<string, { subject: string; body: string }> = {
    pending: {
      subject: 'Your Order is Pending Confirmation',
      body: `
        Hi ${order.customer_name},

        Thank you for placing an order with Karnival Kookies! Your order is currently in a **pending** status. 

        **Order Details:**
        - Order ID: ${order.order_id}
        - Items: ${order.items.map((item: any) => `${item.quantity} x ${item.name}`).join(', ')}

        Once we confirm your order, we’ll update you with the next steps.

        Thanks,
        The Karnival Kookies Team
      `,
    },
    confirmed: {
      subject: 'Your Order Has Been Confirmed!',
      body: `
        Hi ${order.customer_name},

        Great news! Your order has been **confirmed** and is now being processed. 

        **Order Details:**
        - Order ID: ${order.order_id}
        - Items: ${order.items.map((item: any) => `${item.quantity} x ${item.name}`).join(', ')}

        Thanks for choosing Karnival Kookies!

        Regards,
        The Karnival Kookies Team
      `,
    },
    preparing: {
      subject: 'Your Order is Being Prepared',
      body: `
        Hi ${order.customer_name},

        Your order is **being prepared**! Our team is working to ensure your kookies are ready to go.

        **Order Details:**
        - Order ID: ${order.order_id}
        - Items: ${order.items.map((item: any) => `${item.quantity} x ${item.name}`).join(', ')}

        We’ll notify you once your order is shipped.

        Cheers,  
        The Karnival Kookies Team
      `,
    },
    shipped: {
      subject: 'Your Order is On Its Way!',
      body: `
        Hi ${order.customer_name},

        Your order has been **shipped**! You can track your delivery here:

        **Tracking Number:** ${order.tracking_number}
        **Courier:** ${order.courier}
        **Estimated Delivery:** ${order.estimated_delivery}

        Thank you,  
        The Karnival Kookies Team
      `,
    },
    delivered: {
      subject: 'Your Order Has Been Delivered',
      body: `
        Hi ${order.customer_name},

        Hooray! Your order has been successfully **delivered**.

        **Order Details:**
        - Order ID: ${order.order_id}
        - Items: ${order.items.map((item: any) => `${item.quantity} x ${item.name}`).join(', ')}

        Thank you for choosing Karnival Kookies! We hope you enjoy your treats.

        Warm regards,  
        The Karnival Kookies Team
      `,
    },
    cancelled: {
      subject: 'Your Order Has Been Cancelled',
      body: `
        Hi ${order.customer_name},

        Unfortunately, your order has been **cancelled**. If you have any questions, feel free to reach out.

        **Order Details:**
        - Order ID: ${order.order_id}
        - Items: ${order.items.map((item: any) => `${item.quantity} x ${item.name}`).join(', ')}

        Apologies for the inconvenience,  
        The Karnival Kookies Team
      `,
    },
  };

  return (
    templates[status] || {
      subject: 'Order Update',
      body: 'No details available.',
    }
  );
};
export const sendOrderStatusEmail = async (
  email: string,
  status: string,
  order: any,
) => {
  const { subject, body } = generateEmailContent(status, order);

  try {
    await transporter.sendMail({
      from: '"Karnival Kookies" <orders@karnivalkookies.com>', // Replace with your sender email
      to: email,
      subject,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${body}</div>`,
    });

    console.log(`Order status email (${status}) sent to ${email}`);
  } catch (error) {
    console.log('Failed to send email:', error);
  }
};

// async function orderPlaceMail(email: string, order: any) {
//   const info = await transporter.sendMail({
//     from: '"Karnival Kookies" <karnivalkookies@gmail.com>', // ensure you're using a valid email
//     to: email,
//     subject: 'Your Order is Pending Confirmation',
//     text: 'Thank you for your order at Karnival Kookies!',
//     html: `
//         Hi ${order.customer_name},

//         Thank you for placing an order with Karnival Kookies! Your order is currently in a **pending** status.

//         **Order Details:**
//         - Order ID: ${order.order_id}
//         - Items: ${order.items.map((item: any) => `${item.quantity} x ${item.name}`).join(', ')}

//         Once we confirm your order, we’ll update you with the next steps.

//         Thanks,
//         The Karnival Kookies Team
//       `,
//   });
//   return info;
// }
// async function orderConformationMail(email: string, order: any) {
//   const info = await transporter.sendMail({
//     from: '"Karnival Kookies" <karnivalkookies@gmail.com>', // ensure you're using a valid email
//     to: email,
//     subject: 'Your Order is Being Prepared',
//     text: 'Thank you for your order at Karnival Kookies!',
//     html: `
//         Hi ${order.customer_name},

//         Great news! Your order has been **confirmed** and is now being processed.

//         **Order Details:**
//         - Order ID: ${order.order_id}
//         - Items: ${order.items.map((item: any) => `${item.quantity} x ${item.name}`).join(', ')}

//         Thanks for choosing Karnival Kookies!

//         Regards,
//         The Karnival Kookies Team
//       `,
//   });
//   return info;
// }
// async function orderPrepareMail(email: string, order: any) {
//   const info = await transporter.sendMail({
//     from: '"Karnival Kookies" <karnivalkookies@gmail.com>', // ensure you're using a valid email
//     to: email,
//     subject: 'Your Order is Being Prepared',
//     text: 'Thank you for your order at Karnival Kookies!',
//     html: `
//         Hi ${order.customer_name},

//         Great news! Your order has been **confirmed** and is now being processed.

//         **Order Details:**
//         - Order ID: ${order.order_id}
//         - Items: ${order.items.map((item: any) => `${item.quantity} x ${item.name}`).join(', ')}

//         Thanks for choosing Karnival Kookies!

//         Regards,
//         The Karnival Kookies Team
//       `,
//   });
//   return info;
// }
// async function orderShippedMail(email: string, order: any) {
//   const info = await transporter.sendMail({
//     from: '"Karnival Kookies" <karnivalkookies@gmail.com>', // ensure you're using a valid email
//     to: email,
//     subject: 'Your Order is On Its Way!',
//     text: 'Thank you for your order at Karnival Kookies!',
//     html: `
//          Hi ${order.customer_name},

//         Your order has been **shipped**! You can track your delivery here:

//         **Tracking Number:** ${order.tracking_number}
//         **Courier:** ${order.courier}
//         **Estimated Delivery:** ${order.estimated_delivery}

//         Thank you,
//         The Karnival Kookies Team
//       `,
//   });
//   return info;
// }
// async function orderDeliveredMail(email: string, order: any) {
//   const info = await transporter.sendMail({
//     from: '"Karnival Kookies" <karnivalkookies@gmail.com>', // ensure you're using a valid email
//     to: email,
//     subject: 'Your Order Has Been Delivered',
//     text: 'Thank you for your order at Karnival Kookies!',
//     html: `
//           Hi ${order.customer_name},

//         Hooray! Your order has been successfully **delivered**.

//         **Order Details:**
//         - Order ID: ${order.order_id}
//         - Items: ${order.items.map((item: any) => `${item.quantity} x ${item.name}`).join(', ')}

//         Thank you for choosing Karnival Kookies! We hope you enjoy your treats.

//         Warm regards,
//         The Karnival Kookies Team
//       `,
//   });
//   return info;
// }
// async function orderCancelledMail(email: string, order: any) {
//   const info = await transporter.sendMail({
//     from: '"Karnival Kookies" <karnivalkookies@gmail.com>', // ensure you're using a valid email
//     to: email,
//     subject: 'Your Order Has Been Cancelled',
//     text: 'Thank you for your order at Karnival Kookies!',
//     html: `
//          Hi ${order.customer_name},

//         Unfortunately, your order has been **cancelled**. If you have any questions, feel free to reach out.

//         **Order Details:**
//         - Order ID: ${order.order_id}
//         - Items: ${order.items.map((item: any) => `${item.quantity} x ${item.name}`).join(', ')}

//         Apologies for the inconvenience,
//         The Karnival Kookies Team
//       `,
//   });
//   return info;
// }
