import { Request, Response, NextFunction } from "express";
import { UserModel } from "../model/user";

// export const checkUserBanStatus = async (req: Request, res: Response, next: NextFunction) => {

//     try {
//       const { authorId } = req.body;
//       const user = await UserModel.findById(authorId);

//       if (!user) {
//         return res.status(404).json({ error: "User not found" });
//       }

//       if (user.flag === "active") {
//         return next();
//       }
//     // steps should be
//     // 1 if ban
//     // check if it is 24 hr away from banned
//     //  if yes update the ban to active
//     // if no response with 404
//     // if suspended
//     // check if the user is 48 hours after suspension
//     // if yes change status to active
//     // if not respond with 404
//       if (user.flag === "suspended") {
//         return res.status(400).json({ error: "Account Suspended" });
//       }

//       // Check if ban expiry time has passed
//       if (user.flag === "banned" && user.banExpiry && user.banExpiry > new Date()) {
//         // Ban still active, respond with appropriate error message
//         return res.status(403).json({ error: "Your account is currently banned." });
//       } else {
//         // Ban expired, update user status to active
//         user.flag = "active";
//         user.banExpiry = null; // Reset ban expiry
//         await user.save();
//         return next(); // Proceed to the next middleware
//       }
//     } catch (error) {
//       console.error("Error checking user ban status:", error);
//       return res.status(500).json({ error: "Internal server error" });
//     }
//   };

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
      return res.status(404).json({ error: "User not found" });
    }

    if (user.flag === "active") {
      next();
    }

    if (user.flag === "BAN") {
      // User is banned for life
      return res.status(403).json({
        error: "You are permanently banned. You can't comment anymore",
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
        return res.status(403).json({
          error: "You are currently suspended. You can't comment right now",
        });
      }
    } else {
      // why is it here
      return res.status(500).json({ error: "unknown user status" });
    }
  } catch (error) {
    console.error("Error checking user status:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export { checkUserStatus };
