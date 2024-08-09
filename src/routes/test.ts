import express from "express";
import { testSMS, testNotif, testEmail, testNotif3 } from "../controller/test";

const router = express.Router();

router.get("/testSMS", testSMS);
router.post("/verifySms", testNotif3);
router.post("/testNotif", testNotif);
router.post("/testemail", testEmail);


export default router;
