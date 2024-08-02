import express from "express";
import { testSMS, testNotif, testEmail } from "../controller/test";

const router = express.Router();

router.get("/testSMS", testSMS);
// router.post("/verifySms", verifySMS);
router.post("/testNotif", testNotif);
router.post("/testemail", testEmail);


export default router;
