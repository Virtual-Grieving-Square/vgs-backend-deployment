import { Request, Response } from "express";
import { HumanMemorial } from "../model/humanMemorial";
import { checkCommentUsingSapling } from "../util/commentFilter";
import { UserModel } from "../model/user";
import path, { dirname } from "path";

export const getAllHumanMemorial = async (req: Request, res: Response) => {
  try {
    const allhumanMemorials = await HumanMemorial.find().sort({ createdAt: -1 });
    res.status(200).json(allhumanMemorials);
  } catch (error) {
    res.status(500).json({ message: "error fetching pet memorial ", error });
  }
};

export const getHumanMemorialById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const humanMemorial = await HumanMemorial.findById(id);

    if (!humanMemorial) {
      return res.status(408).json({ message: "Memorial not found" });
    }

    res.status(200).json(humanMemorial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const createHumanMemorial = async (req: Request, res: Response) => {
  try {
    const { name, age, description, dob, dod, author } = req.body;
    console.log(req.body);
    console.log(req.files);

    if (req.files?.length === 0) {
      return res.status(406).json({ message: "No image provided" })
    }
    else {

      const coverImage = (req.files as Express.Multer.File[]).map(
        (file: Express.Multer.File) => ({
          url: file.path,
        })
      );
      if (!name || !age || !description || !dob || !dod || !author) {
        return res.status(402).json({ message: "All fields are required" });
      }
      const url = coverImage[0].url;
      const humanMemorial = new HumanMemorial({
        name: name,
        age: age,
        description: description,
        dob: dob,
        dod: dod,
        author: author,
        image: url,
      });

      await humanMemorial.save();

      res
        .status(200)
        .json({ message: "Human Memory created successfully", humanMemorial });
    }

  } catch (error) {
    console.error("Error Human Memorial:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMemorialByUserId = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const humanMemorial = await HumanMemorial.find({
      author: id,
    }).sort({ createdAt: -1 });

    if (!humanMemorial) {
      return res.status(404).json({ message: "Memorial not found" });
    }

    res.status(200).json(humanMemorial);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const getImage = async (req: Request, res: Response) => {
  const image = req.query.name;

  if (!image) {
    return res.status(403).send("Image name is not provided");
  }

  try {
    const location = path.join(__dirname, "../../", String(image));

    res.sendFile(location);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pet memorial ", error });
  }
};

export const getObituaries = async (req: Request, res: Response) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const obituaries = await HumanMemorial.find({ dod: { $lt: sixMonthsAgo } });

    res.status(200).json(obituaries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
