import cors from 'cors';
import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import routes from './app/routes';
import notFoundRoute from './app/middlewares/notFoundRoute';
import path from 'path';

const app: Application = express();

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://pastry-shop-client.vercel.app'],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.static('Images'));
app.use('/', express.static(path.join(process.cwd(), 'Images')));

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home
app.get('/', (req, res) => {
  res.json('Hello world');
});

// Application routes
app.use('/api/v1', routes);

//global error handler
app.use(globalErrorHandler);

//handle not found route
app.use(notFoundRoute);

export default app;
