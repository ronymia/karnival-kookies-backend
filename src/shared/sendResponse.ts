import { Response } from "express";
import { TApiResponse } from "../interfaces/response";

const sendResponse = <T>(res: Response, data: TApiResponse<T>): void => {
  res.status(data?.statusCode).json({
    success: data?.success,
    message: data?.message || null,
    meta: data?.meta,
    data: data?.data || null,
  });
};

export default sendResponse;
