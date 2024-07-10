import express from "express";
import { testSMS, testNotif } from "../controller/test";

const router = express.Router();

router.get("/testSMS", testSMS);
// router.post("/verifySms", verifySMS);
router.post("/testNotif", testNotif);
export default router;
