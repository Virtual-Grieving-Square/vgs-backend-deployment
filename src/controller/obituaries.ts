import { Request, Response } from 'express';

export const getRecentObituaries = async (req: Request, res: Response) => {
  try {

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}