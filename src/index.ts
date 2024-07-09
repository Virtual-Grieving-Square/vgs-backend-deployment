import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { connectDB } from "./database/db";
import cron from "node-cron";
import { initializeFirebase } from "./firebase";
// Scoket.io
import { Server } from "socket.io";

dotenv.config();

// Routes
import index from "./routes";
import admin from "./routes/admin";
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
import wordhub from "./routes/wordhub";
import zoom from "./routes/zoom";
import famous from "./routes/famous";
import zoomAuth from "./routes/authZoom";
import test from "./routes/test";
import obituaries from "./routes/obituaries";
import flower from "./routes/flower";
import image from "./routes/image";
import stripe from "./routes/stripe";
import news from "./routes/news";
import pages from "./routes/pages";
import heroes from "./routes/heroes";
import tombstone from "./routes/tombstone";
import comment from "./routes/comment";

import { fetchAndUpdateNews } from "./cron/newsUpdater";

import { apiAuthMiddleware } from "./middleware/apiAuth";
import { urlList } from "./util/urlList";
import { tokenCheck } from "./middleware/tokenCheckMiddleware";
import { stripeWebhook } from "./util/stripe";

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

// firebase.initializeApp({
//   credential: firebase.credential.cert(serviceAccount),
// });
initializeFirebase();
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req: express.Request, res: express.Response) => {
    const sig = req.headers["stripe-signature"];
    let event: any;
    stripeWebhook(sig, event, res, req);
  }
);

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
// try {
//   console.log("where is it")
//   // Schedule the job to run every hour
//   cron.schedule("0 * * * *", fetchAndUpdateNews);
// } catch (err) {
//   console.log(err);
// }

// Routes
app.use("/", index);
app.use("/admin", admin);
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
app.use("/famous", famous);
app.use("/zoom-auth/", zoomAuth);
app.use("/testsms", test);
app.use("/obituaries", obituaries);
app.use("/flower", flower);
app.use("/getImage", image);
app.use("/stripe", stripe);
app.use("/news", news);
app.use("/pages", pages);
app.use("/tombstone", tombstone);
app.use("/heros", heroes);
app.use("/comment", comment);

// Socket.io Connect
io.on("connection", (socket: any) => {
  console.log("A User Connected", socket.id);

  socket.on("client_like_update", (data: any) => {
    socket.emit("server_update_like", data);
  });

  socket.on("client_new_post", (data: any) => {
    socket.emit("server_new_post");
  });

  socket.on("client_new_memorial", () => {
    socket.emit("server_new_memorial");
  });

  socket.on("client_comment_update", () => {
    socket.emit("server_comment_update");
  });

  socket.on("client_new_hero", () => {
    socket.emit("server_new_hero");
  });

  socket.on("disconnect", () => {
    console.log("A User Disconnected");
  });

  socket.on("client-stripe-account-setup-complete", () => {
    socket.emit("server-stripe-account-setup-complete");
  });
});

server.listen(PORT, () => {
  console.log(
    `R.I.P. Server is running on port http://localhost:${PORT} - ${new Date().toLocaleString()}`
  );
});
