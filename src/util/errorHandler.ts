import { Response } from 'express';

/**
 * @param error error object
 * @param res http response
 * @param customMessage error message provided by route
 * @returns error status with message
 */
const errorHandler = (error: any, res: Response, customMessage: string = 'Error'): Response | null => {
  if (!res) return null;
  const { status, data } = error?.response || {};
  return res.status(status ?? 500).json({ message: data?.message || customMessage });
};

export default errorHandler;
