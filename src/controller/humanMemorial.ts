import { Request, Response } from "express";
import { HumanMemorial } from "../model/humanMemorial";
import { checkCommentUsingSapling } from "../util/commentFilter";
import { UserModel } from "../model/user";

export const createHumanMemorial = async (req: Request, res: Response) => {
  try {
    const { name, age, Description, DOB, DOD, author } = req.body;

    const coverImage = (req.files as Express.Multer.File[]).map(
      (file: Express.Multer.File) => ({
        url: file.path,
      })
    );
    if (!name || !age || !Description || !DOB || !DOD || !author) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const url = coverImage[0].url;
    const humanMemorial = new HumanMemorial({
      name,
      age,
      Description,
      DOB,
      DOD,
      author,
      coverImage: url,
    });

    await humanMemorial.save();

    res
      .status(201)
      .json({ message: "Human Memory created successfully", humanMemorial });
  } catch (error) {
    console.error("Error creating pet memorials:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const fetchHumanMemorial = async (req: Request, res: Response) => {
  try {
    const allhumanMemorials = await HumanMemorial.find();
    res.status(201).json(allhumanMemorials);
  } catch (error) {
    res.status(500).json({ message: "error fetching pet memorial ", error });
  }
};
