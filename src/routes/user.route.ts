import { Recoverable } from "repl";
import {
  login,
  requestPasswordReset,
  resetPassword,
  signup,
} from "../controller/user/auth.controller";
import { createPost } from "../controller/user/post.controller";
import express from "express";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/resetPassword", resetPassword);
router.post("/recoverPassword", requestPasswordReset);

// Media Post Api

router.post("/createPost", createPost);
// router.post('/readPost', readPost);

export default router;
