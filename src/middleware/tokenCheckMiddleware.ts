import { Request, Response, NextFunction } from 'express';
import { getToken } from '../util/token';

interface CustomRequest extends Request {
  headerConfig?: { headers: { Authorization: string } };
}

/**
  * Middleware that checks if a valid (not expired) token exists
  * If invalid or expired, generate a new token and set it, then append to the HTTP request headers
  */
const tokenCheck = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | null = null;

  // Check if a new token needs to be generated
  const { access_token, expires_in, error } = await getToken();

  if (error) {
    const { response, message } = error;
    res.status(response?.status || 401).json({ message: `Authentication Unsuccessful: ${message}` });
  }

  token = access_token;

  // Retrieve token from the request if generated or previously stored
  token = token || (req.headerConfig?.headers?.Authorization?.split(' ')[1] as string) || null;

  // Append token to the request headers
  req.headerConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  next();
};

export { tokenCheck };
