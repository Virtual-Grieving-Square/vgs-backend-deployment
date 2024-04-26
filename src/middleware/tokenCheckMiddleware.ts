import { Request, Response, NextFunction } from 'express';
import { getToken } from '../util/token';

interface CustomRequest extends Request {
  headerConfig?: { headers: { Authorization: string } };
}


const tokenCheck = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | null = null;


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
