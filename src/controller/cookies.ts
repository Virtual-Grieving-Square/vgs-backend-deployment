import { Request, Response } from "express";

export const addCookie = (req: Request, res: Response) => {
  try {

    res.cookie("Add Cookie", 'Cookie Test');
    res.json({ msg: "Add Cookie Router" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export const checkCookie = (req: Request, res: Response) => {
  try {
    // console.log(req.cookies);

    res.status(200).json({ msg: "Check Cookie Router", cookieG: req.cookies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}