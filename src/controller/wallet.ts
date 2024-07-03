import { Request, Response } from "express";
import { UserModel } from "../model/user";
import {
  addToWallet,
  getWalletBalance,
  removeFromWallet,
} from "../util/wallet";
import { WalletModel } from "../model/wallet";

export const wallet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const wallet = await getWalletBalance(id);

    res.status(200).json({ wallet: wallet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const updateWallet = async (req: Request, res: Response) => {
  try {
    const { id, amount } = req.body;

    if (!id || !amount) {
      return res.status(400).json({ message: "Invalid request" });
    }

    await UserModel.updateOne(
      { _id: id },
      {
        $inc: { balance: amount }
      }
    );

    res.status(200).json({ msg: "Update Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const addToWalletFunction = async (req: Request, res: Response) => {
  try {
    const { id, amount } = req.body;

    if (!id || !amount) {
      return res.status(400).json({ message: "Invalid request" });
    }

    addToWallet(id, amount)
      .then((response) => {
        console.log(response);
      })

    res.status(200).json({ msg: "Update Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const removeFromWalletFunction = async (req: Request, res: Response) => {
  try {
    const { id, amount } = req.body;

    if (!id || !amount) {
      return res.status(400).json({ message: "Invalid request" });
    }

    removeFromWallet(id, amount)
      .then((response) => {
        res.status(200).json(response);
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const getWallet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const wallet = await WalletModel.findOne({ userId: id });

    res.status(200).json(wallet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}