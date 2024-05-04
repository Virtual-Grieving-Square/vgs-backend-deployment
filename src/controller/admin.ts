import { Request, Response } from 'express';
import { AdminModel } from '../model/admin';
import bcrypt from 'bcrypt';
import { generateAdminAccessToken } from '../util/generateAdminAccessToken';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body.data;

    if (!email || !password) {
      return res.status(403).json({ message: "Please fill all fields" });
    }

    const admin = await AdminModel.findOne({
      email: email,
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAdminAccessToken(
      admin._id,
      admin.fname,
      admin.lname,
      admin.email,
      admin.role
    );

    res.status(200).json({ accessToken: accessToken });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const signup = async (req: Request, res: Response) => {
  try {
    const { fname, lname, email, role, password } = req.body;

    if (!fname || !lname || !email || !role || !password) {
      return res.status(403).json({ message: "Please fill all fields" });
    }

    const checkAdmin = await AdminModel.findOne({
      email: email,
    });

    if (checkAdmin) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new AdminModel({
      fname: fname,
      lname: lname,
      email: email,
      role: role,
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin created" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}