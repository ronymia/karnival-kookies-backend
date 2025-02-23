import cors from 'cors';
import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import routes from './app/routes';
import notFoundRoute from './app/middlewares/notFoundRoute';
import path from 'path';
import { EmailSend } from './app/cronJobs/newsletter';
import httpStatus from 'http-status';

const app: Application = express();

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://karnival-kookies.netlify.app'],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.static('Images'));
app.use('/', express.static(path.join(process.cwd(), 'Images')));

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//CRON JOBS FOR EMAIL
EmailSend.sendWeeklyNewsletters();

// HOME ROUTE FOR CHECK
app.get('/api', (req, res) => {
  res.status(httpStatus.OK).json({
    message: 'Dear Developer Server is running',
  });
});

// Application routes
app.use('/api', routes);

//global error handler
app.use(globalErrorHandler);

//handle not found route
app.use(notFoundRoute);

export default app;
