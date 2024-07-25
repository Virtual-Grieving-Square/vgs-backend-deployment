import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AdminModel } from "../model/admin";

dotenv.config();

export const checkAdminRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken;

    // Log the Admin Out from The Admin Panel
    if (!token) {
      return res.status(405).json({ message: "Access denied. No token provided." });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    const admin: any = await AdminModel.findOne({
      _id: decoded.id,
    });

    if (admin.suspend != "SA") {
      return res.status(407).json({ message: "Admin is suspended." });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Invalid token." });
  }
}