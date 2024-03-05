import express from "express";
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import { connectDB } from './database/db';

dotenv.config();

// Routes
import users from "./routes/user.route";
import admins from "./routes/admin.router";
import index from "./routes/index.router";
import { apiAuthMiddleware } from "./middleware/apiAuth";
import { urlList } from "./util/urlList";

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: ['http://localhost:3131'],
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(apiAuthMiddleware);


connectDB();

app.use('/', index);
app.use('/user', users);
app.use('/admin', admins);

server.listen(PORT, () => {
  console.log(`R.I.P. Server is running on port ${PORT}! - ${new Date().toLocaleString()}`)
})