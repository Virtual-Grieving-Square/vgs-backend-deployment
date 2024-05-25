import { Request, Response, NextFunction } from "express";
import { UserModel } from "../model/user";

const checkUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Assume you have userId stored in the request, adjust accordingly if not
    const { userId } = req.body; // Assuming you have userId stored in the request

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(402).json({
        error: "User not found",
        msg: "user_not_found",
        message: "User not found in the database. Please login again."
      });
    }
    if (user.flag === "active") {
      next();
    } else if (user.flag === "BAN") {
      // User is banned for life
      return res.status(402).json({
        error: "You are permanently banned. You can't comment anymore",
        msg: "account_banned",
      });
    } else if (user.flag === "suspended") {
      // User is suspended
      if (user.banExpiry && user.banExpiry <= new Date()) {
        // Ban time is over, update user status to active and reset blacklistCount
        user.flag = "active";
        user.blacklistCount = 0;
        user.banExpiry = null;
        await user.save();
        next();
      } else {
        // Ban time has not passed, send suspension message
        return res.status(402).json({
          error: "You are currently suspended. You can't comment right now",
          msg: "account_suspended",
          banMessage: "You are currently suspended. You can't comment right now",
        });
      }
    } else {
      // why is it here
      return res.status(402).json({
        error: "unknown user status",
        msg: "unknown_user_status",
      });
    }
  } catch (error) {
    console.error("Error checking user status:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export { checkUserStatus };
