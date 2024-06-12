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

export const viewSubscritionUpgradePage = (req: Request, res: Response) => {
  try {
    res.render(path.join(__dirname, "../../src/pages/subscription/subscription-upgraded.ejs"), {
      name: "Natnael Engeda",
      subscription: "Silver",
      date: "12-02-2012",
      payment: "5.00",
      time: "13:45"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export const viewSubscriptionDowngradePage = (req: Request, res: Response) => {
  try {
    res.render(path.join(__dirname, "../../src/pages/subscription/subscription-downgrade.ejs"), {
      name: "Natnael Engeda",
      subscription: "Silver",
      date: "12-02-2012",
      payment: "5.00",
      time: "13:45"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Intermal Server Error" });
  }
}

export const viewSubscriptionCancelPage = (req: Request, res: Response) => {
  try {
    res.render(path.join(__dirname, "../../src/pages/subscription/subscription-cancel.ejs"), {
      name: "Natnael Engeda",
      subscription: "Free",
      date: "12-02-2012",
      payment: "0.00",
      time: "13:45"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Intermal Server Error" });
  }
}