import cron from 'node-cron';
import { SubscriberServices } from '../modules/Subscribers/subscribers.service';
import { EmailHelpers } from '../../helpers/emailHelpers';

const sendWeeklyNewsletters = async () => {
  // Schedule the cron job to run every Monday at 9 AM (example time)
  // cron.schedule('* * * * *', async () => {
  cron.schedule('0 9 * * 1', async () => {
    try {
      // GET ALL SUBSCRIBERS FROM DATABASE
      const subscribers = await SubscriberServices.getAllSubscribers([1], {
        page: 1,
      });

      // Iterate through subscribers and send emails
      subscribers.forEach(async (subscriber: any) => {
        await EmailHelpers.sendNewsletter(
          subscriber.email,
          'Weekly Update',
          '<p>Your content here</p>',
        );
        console.log(`Email sent to ${subscriber.email}`);
      });
    } catch (error) {
      console.error({ newsletterError: error });
    }

    console.log('Weekly newsletter job completed.');
  });
};

export const EmailSend = { sendWeeklyNewsletters };
