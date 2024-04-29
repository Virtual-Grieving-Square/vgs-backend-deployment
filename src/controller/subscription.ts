import { Request, Response } from "express";
import { SubscriptionPlanModel } from "../model/subscriptionPlan";
import { UserModel } from "../model/user";
import PaymentListModel from "../model/paymentList";
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY!);

const YOUR_DOMAIN = process.env.DOMAIN!;

export const getAll = async (req: Request, res: Response) => {
  try {
    const subscriptions = await SubscriptionPlanModel.find();

    res.status(200).json({
      msg: "All Subscription Plans",
      subscription: subscriptions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Internal Server Error",
      error: error
    });
  }
}

export const createSubscriptionPlan = async (req: Request, res: Response) => {
  try {
    const { name, price, description, details } = req.body;
    await SubscriptionPlanModel.create({
      name: name,
      price: price,
      description: description,
      details: details
    });

    res.status(200).json({
      msg: "Subscription Plan Created"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Internal Server Error",
      error: error
    });
  }
}

export const test = async (req: Request, res: Response) => {
  try {

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: 'price_1PA8MtFEZ2nUxcULpROyvFrW',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${YOUR_DOMAIN}?success=true`,
      cancel_url: `${YOUR_DOMAIN}?canceled=true`,
      automatic_tax: { enabled: true },
    });

    // res.redirect(303, session.url);
    res.status(200).json({
      request: "success",
      session: session
    })

  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      msg: "Internal Server Error",
      error: error
    });
  }
}

export const pay = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const user = await UserModel.findById(id);
    var price = "";

    if (user) {
      if (user.subscriptionType == "silver") {
        price = "price_1PABuPFEZ2nUxcULGeQfmIs7";
      } else if (user.subscriptionType == "gold") {
        price = "price_1PABvTFEZ2nUxcULGaj999zd";
      }
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: price,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${YOUR_DOMAIN}?payment=success?id=${id}`,
      cancel_url: `${YOUR_DOMAIN}?payment=canceled?id=${id}`,
      automatic_tax: { enabled: true },
    });


    const checkUser = await PaymentListModel.findOne({
      userId: id
    });

    if (checkUser) {
      if (checkUser.paid == true) {
        res.status(201).json({
          request: "success",
          msg: "User Already Paid"
        });
      } else {
        await PaymentListModel.updateOne({
          userId: id
        }, {
          paymentId: session.id,
          amount: session.amount_total
        });

        res.status(200).json({
          request: "success",
          session: session,
          client_secret: session.client_secret
        });
      }
    } else {
      await PaymentListModel.create({
        paymentId: session.id,
        userId: id,
        amount: session.amount_total
      });

      res.status(200).json({
        request: "success",
        session: session,
        client_secret: session.client_secret
      });
    }
    // await PaymentListModel.create({
    //   paymentId: session.id,
    //   userId: id,
    //   amount: session.amount_total
    // });






  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Internal Server Error",
      error: error
    });
  }
}

const endpointSecret = "whsec_4cfbe1dc0651f6c6632e9f4bcef99cd2cb463682d95b466169ded6c615622391";

export const stripe_webhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'];

    console.log(sig)
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log(event)

    } catch (err: any) {
      console.error(err);

      // res.status(405).send(`Webhook Error: ${err.message}`);
      return;
    }

    // // Handle the event
    // switch (event.type)  {
    //   case 'payment_intent.succeeded':
    //     const paymentIntentSucceeded = event.data.object;
    //     // Then define and call a function to handle the event payment_intent.succeeded
    //     console.log("Payment Was Successful")
    //     break;
    //   // ... handle other event types
    //   default:
    //     console.log(`Unhandled event type ${event.type}`);
    // }

    // res.status(200).json({
    //   msg: "Webhook Received"
    // });


  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Internal Server Error",
      error: error
    });
  }
}