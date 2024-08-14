import express from "express";
import { Connect, Disconnect } from "../controller/webSockets";

const router = express.Router();

router.post("/connection", Connect);
router.post("/disconnect", Disconnect);

export default router;
