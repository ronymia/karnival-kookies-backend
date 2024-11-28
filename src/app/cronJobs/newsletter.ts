import cron from 'node-cron';
import { SubscriberServices } from '../modules/Subscribers/subscribers.service';
import { EmailHelpers } from '../../helpers/emailHelpers';

// Schedule the cron job to run every Monday at 9 AM (example time)
cron.schedule('0 9 * * 1', async () => {
  console.log('Weekly newsletter job started...');

  try {
    // Fetch subscribers from the database
    const subscribers = await SubscriberServices.getAllSubscribers([1], {
      page: 1, // Adjust pagination or filters as needed
    }); // Implement this function to query the database

    // Iterate through subscribers and send emails
    for (const subscriber of subscribers) {
      await EmailHelpers.sendNewsletter(
        subscriber.email,
        'Weekly Update',
        '<p>Your content here</p>',
      );
      console.log(`Email sent to ${subscriber.email}`);
    }
  } catch (error) {
    console.error({ newsletterError: error });
  }

  console.log('Weekly newsletter job completed.');
});

cron.schedule('* * * * *', () => {
  console.log('Cron job test: Running every minute');
});
