import express from "express";
import { viewDepositPage } from "../controller/pages";

const router = express.Router();

router.get("/viewDepositPage", viewDepositPage);


export default router;