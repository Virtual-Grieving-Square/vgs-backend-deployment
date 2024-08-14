import express from "express";
import { Connect, Disconnect, Defualt } from "../controller/webSockets";

const router = express.Router();

router.post("/connection", Connect);
router.post("/defualt", Defualt);
router.post("/disconnect", Disconnect);

export default router;
