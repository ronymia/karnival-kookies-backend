import cron from 'node-cron';
import { SubscriberServices } from '../modules/Subscribers/subscribers.service';
import { EmailHelpers } from '../../helpers/emailHelpers';
import { errorLogger, logger } from '../../shared/logger';

const sendWeeklyNewsletters = async () => {
  // Schedule the cron job to run every Monday at 9 AM (example time)
  // cron.schedule('* * * * *', async () => {
  cron.schedule('0 9 * * 1', async () => {
    try {
      // GET ALL SUBSCRIBERS FROM DATABASE
      const subscribers = await SubscriberServices.getAllSubscribers({}, {});

      // Iterate through subscribers and send emails
      subscribers.forEach(async (subscriber: { [key: string]: string }) => {
        await EmailHelpers.sendNewsletter(
          subscriber.email,
          'Weekly Update',
          '<p>Your content here</p>',
        );
        logger.info(`Email sent to ${subscriber.email}`);
      });
    } catch (error) {
      errorLogger.error(error);
    }
  });
};

export const EmailSend = { sendWeeklyNewsletters };
