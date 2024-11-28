import cron from 'node-cron';
import { SubscriberServices } from '../modules/Subscribers/subscribers.service';
import { EmailHelpers } from '../../helpers/emailHelpers';

cron.schedule('*/2 * * * *', async () => {
  // Fetch subscribers and send newsletters
  console.log('Sending weekly newsletters...');
  const subscribers = await SubscriberServices.getAllSubscribers([1], {
    page: 1,
  }); // Implement this function
  try {
    subscribers.forEach(async (subscriber: any) => {
      await EmailHelpers.sendNewsletter(
        subscriber.email,
        'Weekly Update',
        '<p>Your content here</p>',
      );

      console.log(`Email sent to ${subscriber.email}`);
    });
  } catch (error) {
    console.log({ newsletterError: error });
  }
});

(async () => {
  try {
    const result = await EmailHelpers.sendNewsletter(
      'mdronymia040@gmail.com.com',
      'Test Subject',
      '<p>This is a test email</p>',
    );
    console.log('Test email result:', result);
  } catch (error) {
    console.error('Test email failed:', error);
  }
})();
