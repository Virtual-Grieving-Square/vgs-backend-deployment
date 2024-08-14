import { Request, Response } from "express";
import { UserModel } from "../model/user";
import { handleAuthentication } from "../util/socketAuthentication";

export const Connect = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    console.log("connection started");
    console.log("connection header", req.headers);
    console.log("connection query", req.query);
    console.log("connection body", req.body);
   
    console.log("connection started");

    res.status(200).json({ msg: "connection recived" });
  } catch (error) {
    console.error("connection error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const Disconnect = async (req: Request, res: Response) => {
  try {
    console.log("Disconnected");

    const data = req.body;

    res.status(200).json({ msg: "Webhook disconnected" });
  } catch (error) {
    console.error("Disconnection error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
