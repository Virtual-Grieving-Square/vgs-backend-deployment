import express from "express";

import users from "./routes/user.route";
import admins from "./routes/admin.router"; 
import { connectDB } from './database/db';

const app = express();
const PORT = process.env.PORT || 3000;



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB()
    .then((res) => {})
app.use('/users', users);
app.use('/admin', admins);

app.listen(PORT, () => {
  console.log(`R.I.P. Server is running on port ${PORT}! - ${new Date().toLocaleString()}`)
})