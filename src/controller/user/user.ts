import { Request, Response } from "express";
import { UserModel } from "../../model/user";


export const getDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}


export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    if (req.file) {
      const file = req.file;
      res.status(201).json({ message: "Image uploaded successfully" });
    } else {
      res.status(400).json({ message: "Image not uploaded" });
    }



  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}