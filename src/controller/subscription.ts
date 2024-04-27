import { Request, Response } from "express";

export const test = (res: Response, req: Request) => {
  try {

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
}