import { Request, Response } from "express";
import path from "path";

export const viewDepositPage = async (req: Request, res: Response) => {
  try {
    res.render(path.join(__dirname, "../../src/pages/deposit/money-deposit.ejs"), {
      name: `${"Natnael"} ${"Engeda"}`,
      email: "nattynengeda@gmail.com",
      amount: "240",
      donatedFor: "Some Dead",
      date: "2024-12-12",
      type: "Deposit",
      confirmation: "Confirmed",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}