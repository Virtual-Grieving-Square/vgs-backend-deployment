import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { connectDB } from "./database/db";
import firebase from "firebase-admin";
import Stripe from 'stripe';
import * as fs from 'fs';

// Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY!);

// Scoket.io
import { Server } from 'socket.io';

dotenv.config();

// Routes
import index from "./routes";
import auth from "./routes/auth";
import users from "./routes/user";
import post from "./routes/post";
import admins from "./routes/admin";
import streaming from "./routes/streaming";
import subsciption from "./routes/subscription";
import group from "./routes/group";
import wallet from "./routes/wallet";
import email from "./routes/email";
import contact from "./routes/contact";
import donation from "./routes/donation";
import product from "./routes/product";
import Memorial from "./routes/memorial";
import wordhub from './routes/wordhub';
import zoom from './routes/zoom';

import { apiAuthMiddleware } from "./middleware/apiAuth";
import { urlList } from "./util/urlList";
import { tokenCheck } from "./middleware/tokenCheckMiddleware";
import PaymentListModel from "./model/paymentList";
import { UserModel } from "./model/user";

var serviceAccount = require("../serviceAccountKey.json");

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: urlList,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

// app.use((req: express.Request, res: express.Response, next: express.NextFunction): void => {
//   console.log(req.originalUrl);
//   if (req.originalUrl === '/webhook') {
//     next();
//   } else {
//     express.json();
//     console.log("Here with express.json()")
//   }
// }
// );

const endpointSecret = "whsec_4cfbe1dc0651f6c6632e9f4bcef99cd2cb463682d95b466169ded6c615622391";

app.post("/webhook", express.raw({ type: "application/json" }), async (req: express.Request, res: express.Response) => {
  const sig = req.headers['stripe-signature'];

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    res.status(407).send(`Webhook Error: ${err.message}`);
    return;
  }

  let intent: any = null;

  switch (event['type']) {
    case "checkout.session.completed":
      const checkOutId = event.data.object.id;
      const paymentStatus = event.data.object.payment_status;
      console.log("Payment Status: ", paymentStatus)
      if (paymentStatus === "paid") {

        const paidd = await PaymentListModel.updateOne({
          paymentId: checkOutId
        }, {
          paid: true
        });

        const user = await PaymentListModel.findOne({
          paymentId: checkOutId
        });

        await UserModel.updateOne({
          _id: user!.userId
        }, {
          paid: true
        });

        console.log("Paid: ", paidd);
      }

      fs.writeFileSync('event.json', JSON.stringify(event.data.object, null, 2));
      break;
  }
  res.json({ received: true });

});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: urlList,
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// app.use(apiAuthMiddleware);


app.set("view engine", "ejs");
app.use(express.static("public"));

connectDB();

// Routes
app.use("/", index);
app.use("/auth", auth);
app.use("/user", users);
app.use("/post", post);
app.use("/streaming", streaming);
app.use("/subscription", subsciption);
app.use("/group", group);
app.use("/admin", admins);
app.use("/wallet", wallet);
app.use("/email", email);
app.use("/contact", contact);
app.use("/donation", donation);
app.use("/product", product);
app.use("/memorial", Memorial);
app.use("/words", wordhub);
app.use("/meetings", tokenCheck, zoom);

// Use JSON parser for all non-webhook routes

// Socket.io Connect
io.on("connection", (socket: any) => {
  console.log("A User Connected", socket.id);

  socket.on("client_like_update", (data: any) => {
    console.log("client_like_update", data);
  });

  socket.on("client_new_post", (data: any) => {
    socket.emit("server_new_post");
  });

  socket.on("client_new_memorial", () => {
    socket.emit("server_new_memorial");
  })

  socket.on("disconnect", () => {
    console.log("A User Disconnected");
  });
});

server.listen(PORT, () => {
  console.log(
    `R.I.P. Server is running on port http://localhost:${PORT} - ${new Date().toLocaleString()}`
  );
});
