import { Request, Response, } from 'express';

export const index = (req: Request, res: Response) => {
  try {
    res.status(200).json({ message: "Welcome to the R.I.P. API" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}