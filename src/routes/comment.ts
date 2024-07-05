import { Router } from "express";
import {
  blockComment,
  editDonationComment,
  editFlowerDonationComment,
  editMemorialComment,
  fetchComments,
  unblockComment,
} from "../controller/comment";

import {
  likeDonationComment,
  likeFlowerDonationComment,
} from "../controller/donation";

import { likeComment } from "../controller/humanMemorial";
import express, { Request, Response, NextFunction } from "express";
const router = Router();

router.get("/:id", fetchComments);
router.post(
  "/likeComments",
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId, likerId, type } = req.body;
    if (type == "FlowerDonation") {
      await likeFlowerDonationComment(req, res);
    } else if (type == "Donation") {
      await likeDonationComment(req, res);
    } else if (type == "Memorial") {
      await likeComment(req, res);
    } else {
      res.status(400).json({ msg: "Unknown type" });
    }
  }
);

router.post(
  "/Comments/edit",
  async (req: Request, res: Response, next: NextFunction) => {
    const { commentId, type } = req.body;
    if (type == "flower-donation") {
      await editFlowerDonationComment(req, res);
    } else if (type == "donation") {
      await editDonationComment(req, res);
    } else if (type == "memorial") {
      await editMemorialComment(req, res);
    } else {
      res.status(400).json({ msg: "Unknown type" });
    }
  }
);

router.put("/block", blockComment);
router.put("/unblock", unblockComment);

export default router;
