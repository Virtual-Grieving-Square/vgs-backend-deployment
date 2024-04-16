import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { connectDB } from "./database/db";
import firebase from "firebase-admin";
import { Server as SocketIOServer } from "socket.io";

// Scoket.io
import { getIO, initialize } from "./util/socket.io";

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
import pet from "./routes/pet";
import Human from "./routes/humanMemorial";
import wordhub from "./routes/wordhub";
import liveStreaming from "./routes/liveStreaming";

import { apiAuthMiddleware } from "./middleware/apiAuth";
import { urlList } from "./util/urlList";

var serviceAccount = require("../serviceAccountKey.json");

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
// const ios = new SocketIOServer(server);

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
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

// Socket.io
initialize(server, {
  origin: urlList,
  methods: ["GET", "POST", "PUT", "DELETE"],
});

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
app.use("/pet", pet);
app.use("/human", Human);
app.use("/words", wordhub);
app.use("/live-streaming", liveStreaming);
// Socket.io Connect
const io = getIO();

io.on("connection", (socket: any) => {
  console.log("A User Connected", socket.id);

  socket.on("Join-room", (roomId: any, userId: any) => {
    console.log(roomId);
    socket.join(roomId);
    // socket.to(roomId).broadcast.emit("user-connected", userId);
    io.to(roomId).emit("user-connected", userId);
  });

  io.on("client_like_update", (data: any) => {
    console.log("client_like_update", data);
  });

  // socket.on("disconnect", () => {
  //   console.log("A User Disconnected");
  // });
});

server.listen(PORT, () => {
  console.log(
    `R.I.P. Server is running on port ${PORT}! - ${new Date().toLocaleString()}`
  );
});
