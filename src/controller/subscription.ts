import { Request, Response } from "express";
import { SubscriptionPlanModel } from "../model/subscriptionPlan";
import { UserModel } from "../model/user";
import PaymentListModel from "../model/paymentList";
import DepositListModel from "../model/depositList";
import { generateOrderNumber } from "../util/generateOrderNumber";
import bcrypt from "bcrypt";

const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!);

const YOUR_DOMAIN = process.env.DOMAIN!;

export const getAll = async (req: Request, res: Response) => {
  try {
    const subscriptions = await SubscriptionPlanModel.find();

    res.status(200).json({
      msg: "All Subscription Plans",
      subscription: subscriptions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Internal Server Error",
      error: error,
    });
  }
};

export const createSubscriptionPlan = async (req: Request, res: Response) => {
  try {
    const { name, price, description, details, storagrPerk } = req.body;
    await SubscriptionPlanModel.create({
      name: name,
      price: price,
      description: description,
      details: details,
      storagrPerk: storagrPerk,
    });

    res.status(200).json({
      msg: "Subscription Plan Created",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Internal Server Error",
      error: error,
    });
  }
};

export const test = async (req: Request, res: Response) => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: "price_1PA8MtFEZ2nUxcULpROyvFrW",
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${YOUR_DOMAIN}?success=true`,
      cancel_url: `${YOUR_DOMAIN}?canceled=true`,
      automatic_tax: { enabled: true },
    });

    // res.redirect(303, session.url);
    res.status(200).json({
      request: "success",
      session: session,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      msg: "Internal Server Error",
      error: error,
    });
  }
};

export const pay = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const user = await UserModel.findById(id);
    var price = "";

    const checkUser = await UserModel.findById(id);

    console.log(checkUser);

    if (user) {
      if (checkUser!.paid == true) {
        res.status(201).json({
          request: "success",
          msg: "User Already Paid",
        });
      } else {
        if (user) {
          if (user.subscriptionType == "silver") {
            price = "price_1PABuPFEZ2nUxcULGeQfmIs7";
          } else if (user.subscriptionType == "gold") {
            price = "price_1PABvTFEZ2nUxcULGaj999zd";
          }

          const orderNumber = generateOrderNumber(20);

          const session = await stripe.checkout.sessions.create({
            line_items: [
              {
                price: price,
                quantity: 1,
              },
            ],
            mode: "subscription",
            success_url: `${YOUR_DOMAIN}?payment=success&id=${id}`,
            cancel_url: `${YOUR_DOMAIN}?payment=canceled&id=${id}`,
            automatic_tax: { enabled: true },
          });


          await PaymentListModel.create({
            paymentId: session.id,
            userId: id,
            amount: session.amount_total,
          });

          res.status(200).json({
            request: "success",
            session: session,
            client_secret: session.client_secret,
          });

        } else {
          res.status(404).json({
            request: "failed",
            msg: "User Not Found",
          });
        }
      }
    } else {
      res.status(404).json({
        request: "failed",
        msg: "User Not Found",
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Internal Server Error",
      error: error,
    });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { id, password } = req.body;

    console.log(id, password)

    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(402).json({ msg: "User Not Found" });
    } else {
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(403).json({ msg: "Password Incorrect" });
      } else {
        await UserModel.updateOne({
          _id: id,
        },
          {
            subscriptionType: "free",
            subscribed: false,
          });
      }
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Internal Server Error",
      error: error,
    });
  }
}

export const deposit = async (req: Request, res: Response) => {
  try {
    const { id, amount } = req.body;

    const depostList = [
      { id: 1, amount: 5 },
      { id: 2, amount: 10 },
      { id: 3, amount: 15 },
      { id: 4, amount: 20 },
    ];

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Deposit",
            },
            unit_amount: depostList[amount - 1].amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/account?success=true`,
      cancel_url: `${YOUR_DOMAIN}/account?canceled=true`,
      automatic_tax: { enabled: true },
    });

    await DepositListModel.create({
      paymentId: session.id,
      userId: id,
      amount: depostList[amount - 1].amount,
    }).then(() => {
      res.status(200).json({
        request: "success",
        session: session,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Internal Server Error",
      error: error,
    });
  }
};

