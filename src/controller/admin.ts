import { Request, Response } from 'express';
import { AdminModel } from '../model/admin';
import bcrypt from 'bcrypt';
import { generateAdminAccessToken } from '../util/generateAdminAccessToken';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body.data;
    console.log("Here");

    if (!email || !password) {
      return res.status(403).json({ message: "Please fill all fields" });
    }

    const admin: any = await AdminModel.findOne({
      email: email,
    });

    console.log(admin);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res.status(402).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAdminAccessToken(
      admin._id,
      admin.fname,
      admin.lname,
      admin.email,
      admin.role,
      admin.type
    );

    // res.cookie("accessToken", accessToken, {
    //   httpOnly: process.env.NODE_ENV === 'production', // Ensures the cookie is sent only over HTTP(S), not client JavaScript
    //   secure: process.env.NODE_ENV === 'production', // Ensures the cookie is sent only over HTTPS in production
    //   sameSite: 'strict', // Helps prevent CSRF attacks
    // });

    res.cookie("accessToken", accessToken, {
      httpOnly: false, // Ensures the cookie is sent only over HTTP(S), not client JavaScript
      secure: false, // Ensures the cookie is sent only over HTTPS in production
      sameSite: 'strict', // Helps prevent CSRF attacks
    });

    res.status(200).json({ accessToken: accessToken });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const signup = async (req: Request, res: Response) => {
  try {
    const { fname, lname, email, role, password, type } = req.body;

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
      type: type,
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(200).json({ message: "Admin created" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const viewAll = async (req: Request, res: Response) => {
  try {
    const admin = await AdminModel.find();

    res.status(200).json({ admin: admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(403).json({ message: "Please provide id" });
    }

    await AdminModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Admin deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
export const suspendAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(403).json({ message: "Please provide id" });
    }

    const admin = await AdminModel.findById(id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await AdminModel.findByIdAndUpdate(id, { suspend: !admin.suspend });

    res.status(200).json({ message: "Admin suspended" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}