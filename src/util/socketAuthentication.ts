// authUtils.ts

import { Socket } from "socket.io";
import { UserModel } from "../model/user"; // Adjust as per your schema
import jwt from "jsonwebtoken";
import config from "../config";

export const handleAuthentication = (socket: Socket, token: any) => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      // Verify and decode token (JWT or similar)
      //   const decodedToken = jwt.verify(token, config.JWT_TOKEN);
      //   const userId = (decodedToken as any).userId;
      const userId = token.id;

      if (!userId) {
        console.log(`Invalid token`);
        return reject(new Error("Invalid token"));
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        console.log(`User ${userId} not found`);
        return reject(new Error("User not found"));
      }

      // Update or set socketId in database
      user.socketId = socket.id;
      await user.save();
      console.log(
        `User ${userId} authenticated and associated with socket ${socket.id}`
      );
      resolve();
    } catch (error) {
      console.error(`Error authenticating user: ${error}`);
      reject(error);
    }
  });
};
