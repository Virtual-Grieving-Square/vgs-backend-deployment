import { Request, Response } from "express";
import { UserModel } from "../model/user";

// Axios
import axios from "axios";
import { sendEmailClaimer } from "../util/email";
import { WalletModel } from "../model/wallet";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!);

const YOUR_DOMAIN = process.env.DOMAIN;

export const stripeBalace = async (req: Request, res: Response) => {
  try {
    const balance = await stripe.balance.retrieve();

    res.status(200).json({ balance: balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, msg: "Internal Server Error" });
  }
};

export const addStripeAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);

    if (user!.stripeAccountCompleted == true) {
      res.status(201).json({ status: true, msg: "Account already created" });
    } else {
      stripe.accounts
        .create({
          type: "express",
          capabilities: {
            transfers: { requested: true },
          },
        })
        .then((response: any) => {
          const accountId = response.id;
          return accountId;
        })
        .then(async (response: any) => {
          const accountId = response;
          const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${YOUR_DOMAIN}/account`,
            return_url: `${YOUR_DOMAIN}/account`,
            type: "account_onboarding",
          });

          const user = await UserModel.findById(id);
          if (user?.stripeAccountId == "") {
            user.stripeAccountId = accountId;
            user.stripeAccountCompleted = true;
            await user.save();
            res.status(200).json({ url: accountLink.url });
          } else {
            await UserModel.findByIdAndUpdate(id, {
              stripeAccountId: accountId,
            });
            res.status(200).json({ url: accountLink.url });
          }
        })
        .catch((error: any) => {
          console.error(error);
          const errorMessage = error?.message || "An error occurred";
          res.status(400).json({
            errormsg: errorMessage,
            error: error,
            msg: "Error in creating account",
          });
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, msg: "Internal Server Error" });
  }
};

export const updateAccountRegistration = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);

    const accountLink = await stripe.accountLinks.create({
      account: user?.stripeAccountId,
      refresh_url: `${YOUR_DOMAIN}/account`,
      return_url: `${YOUR_DOMAIN}/account`,
      type: "account_onboarding",
    });

    res.status(200).json({
      url: accountLink,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, msg: "Internal Server Error" });
  }
};

export const logintToAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);

    const loginLink = await stripe.accounts.createLoginLink(
      user?.stripeAccountId,
      {
        redirect_url: YOUR_DOMAIN,
      }
    );

    res.status(200).json({
      url: loginLink,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, msg: "Internal Server Error" });
  }
};

export const addStripeAccount2 = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const account = await stripe.accounts
      .create({
        type: "express",
        email: email,
      })
      .then((response: any) => {
        const accountId = response.id;
        return accountId;
      })
      .then(async (response: any) => {
        const accountId = response;
        const accountLink = await stripe.accountLinks.create({
          account: accountId,
          refresh_url: `${YOUR_DOMAIN}/refresh`,
          return_url: `${YOUR_DOMAIN}/return`,
          type: "account_onboarding",
        });

        res.status(200).json({ url: accountLink.url });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, msg: "Internal Server Error" });
  }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { amount, currency, customerEmail } = req.body;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: "Add Balance",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/success.html`,
      cancel_url: `${YOUR_DOMAIN}/cancel.html`,
      customer_email: customerEmail,
    });

    res.status(200).json({ id: session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, msg: "Internal Server Error" });
  }
};

// export const transferFunds = async (req: Request, res: Response) => {
//   try {
//     const { amount, userId } = req.body;

//     const transfer = await stripe.transfers.create({
//       amount: amount * 100,
//       currency: "usd",
//       destination: userId,
//     });

//     res.status(200).json({ success: true, transfer: transfer });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error, msg: "Internal Server Error" });
//   }
// };

export const transferFunds = async (req: Request, res: Response) => {
  try {
    const { amount, userId } = req.body;

    // Ensure amount and userId are provided
    if (!amount || !userId) {
      return res
        .status(400)
        .json({ error: "Missing required fields: amount or userId" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const balance = Number(user.balance);
    const amountToWithdraw = Number(amount);

    if (balance < amountToWithdraw) {
      return res.status(404).json({ error: "Insufficient balance" });
    }
    // Create a transfer
    const transfer = await stripe.transfers.create({
      amount: amount * 100, // Amount in cents
      currency: "usd",
      destination: user.stripeAccountId,
    });

    await WalletModel.updateOne(
      { userId: user._id },
      { $inc: { balance: -amountToWithdraw } }
    );

    await sendEmailClaimer({
      name: user!.firstName + " " + user!.lastName,
      email: user!.email,
      amount: amount,
      date: new Date().toISOString().split("T")[0],
      type: "Withdrawal",
      confirmation: "Confirmed",

      recieverEmail: user!.email,
    })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error(error);
      });

    res.status(200).json({ success: true, transfer });
  } catch (error: any) {
    console.error(error);

    const errorMessage = error?.message || "An error occurred";
    const errorType = error?.type || "UnknownError";
    const errorCode = error?.code || "unknown_error";
    const statusCode = error?.statusCode || 500;

    let httpStatusCode = 500;
    if (errorType === "StripeInvalidRequestError") {
      httpStatusCode = 400;
    } else if (errorType === "StripeCardError") {
      httpStatusCode = 402;
    } else if (errorType === "StripeAPIError") {
      httpStatusCode = 500;
    } else if (errorType === "StripeConnectionError") {
      httpStatusCode = 502;
    } else if (errorType === "StripeAuthenticationError") {
      httpStatusCode = 401;
    }

    res.status(httpStatusCode).json({
      success: false,
      error: errorMessage,
      type: errorType,
      code: errorCode,
      msg: "Error in processing transfer",
    });
  }
};

export const checkAccountStatus = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.body;

    if (!accountId) {
      return res
        .status(400)
        .json({ error: "Missing required field: accountId" });
    }

    const account = await stripe.accounts.retrieve(accountId);

    const isRestricted = account.requirements.disabled_reason !== null;
    const isEnabled = account.capabilities.transfers === "active";

    let accountStatus = "unknown";
    if (isRestricted) {
      accountStatus = "restricted";
    } else if (isEnabled) {
      accountStatus = "enabled";
    }

    res.status(200).json({
      success: true,
      accountStatus,
      requirements: account.requirements,
      capabilities: account.capabilities,
    });
  } catch (error: any) {
    console.error(error);

    const errorMessage = error?.message || "An error occurred";
    const errorType = error?.type || "UnknownError";
    const errorCode = error?.code || "unknown_error";
    const statusCode = error?.statusCode || 500;

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      type: errorType,
      code: errorCode,
      msg: "Error in checking account status",
    });
  }
};

export const disconnectAccount = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.body;

    if (!accountId) {
      return res
        .status(400)
        .json({ error: "Missing required field: accountId" });
    }

    const deletedAccount = await stripe.accounts.del(accountId);
    const user = await UserModel.findOne({ stripeAccountId: accountId });

    if (user) {
      user.stripeAccountId = "";
      user.stripeAccountCompleted = false;
      await user.save();
    }

    if (deletedAccount.deleted) {
      res
        .status(200)
        .json({ success: true, message: "Account disconnected successfully" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Failed to disconnect account" });
    }
  } catch (error: any) {
    const errorMessage = error?.message || "An error occurred";
    const errorType = error?.type || "UnknownError";
    const errorCode = error?.code || "unknown_error";
    const statusCode = error?.statusCode || 500;

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      type: errorType,
      code: errorCode,
      msg: "Error in disconnecting account",
    });
  }
};
export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount, currency, customerEmail } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: currency,
      receipt_email: customerEmail,
      metadata: { integration_check: "accept_a_payment" },
    });

    res.status(200).json({ client_secret: paymentIntent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, msg: "Internal Server Error" });
  }
};

export const processPayout = async (req: Request, res: Response) => {
  try {
    const { amount, currency, connectedAccountId } = req.body;

    // Step 1: Transfer funds from platform account to connected account
    stripe.transfers
      .create({
        amount: amount * 100, // amount in cents
        currency: currency,
        destination: connectedAccountId,
      })
      .then((response: any) => {
        console.log(response);
        res.status(200).json({ transfer: response });
      })
      .catch((error: any) => {
        console.error(error);
        res.status(500).json({ error: error, msg: "Internal Server Error" });
      });

    // Step 2: Create a payout from the connected account to the user's bank account
    // const payout = await stripe.payouts.create({
    //   amount: amount * 100,  // amount in cents
    //   currency: currency,
    //   method: 'standard',  // or 'instant' for instant payouts
    // }, {
    //   stripeAccount: connectedAccountId,
    // });

    // res.status(200).json({ transfer, payout });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, msg: "Internal Server Error" });
  }
};
