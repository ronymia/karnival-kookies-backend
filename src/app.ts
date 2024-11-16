import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import routes from "./app/routes";
import notFoundRoute from "./app/middlewares/notFoundRoute";

const app: Application = express();

app.use(cors());
app.use(cookieParser());

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Application routes
app.use("/api/v1", routes);

//global error handler
app.use(globalErrorHandler);

//handle not found route
app.use(notFoundRoute);

export default app;
