import { Request, Response } from "express";
import { Heroes } from "../model/heroes";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../util/awsAccess";
import { removeSpaces } from "../util/removeSpace";

import { Stream } from "stream";
import { UserModel } from "../model/user";

export const getAllHeroes = async (req: any, res: Response) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const allheroes = await Heroes.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Heroes.countDocuments();

    res.status(200).json({
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
      memorials: allheroes,
    });
  } catch (error) {
    res.status(500).json({ message: "error fetching hero ", error });
  }
};

export const getHeroById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const hero = await Heroes.findById(id);

    if (!hero) {
      return res.status(408).json({ message: "Hero not found" });
    }

    res.status(200).json(hero);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createHero = async (req: Request, res: Response) => {
  try {
    const { name, age, description, dob, dod, author, relation } = req.body;
    console.log(req.body);
    console.log(req.files);

    if (req.files?.length === 0) {
      return res.status(406).json({ message: "No image provided" });
    } else {
      const fileOrgnName = req.file?.originalname || "";
      const fileName = `uploads/image/Hero/${Date.now()}-${removeSpaces(
        fileOrgnName
      )}`;

      const uploadParams = {
        Bucket: "vgs-upload",
        Key: fileName,
        Body: req.file?.buffer,
        ContentType: req.file?.mimetype,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      if (!name || !age || !description || !dob || !dod || !author) {
        return res.status(402).json({ message: "All fields are required" });
      }
      const heroes = new Heroes({
        name: name,
        age: age,
        description: description,
        dob: dob,
        dod: dod,
        author: author,
        image: fileName,
        relation: relation,
      });

      await heroes.save();

      res
        .status(200)
        .json({ message: "Hero Memory created successfully", heroes });
    }
  } catch (error) {
    console.error("Error Hero Memorial:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getHeroByUserId = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const heroes = await Heroes.find({
      author: id,
    }).sort({ createdAt: -1 });

    if (!heroes) {
      return res.status(404).json({ message: "Hero not found" });
    }

    res.status(200).json(heroes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getImage = async (req: Request, res: Response) => {
  try {
    const name = req.query.name as string | "";

    if (!name) {
      return res.status(403).send("Image name is not provided");
    }

    const command = new GetObjectCommand({
      Bucket: "vgs-upload",
      Key: name,
    });

    const { Body } = await s3Client.send(command);

    if (Body instanceof Stream) {
      Body.pipe(res);
    } else {
      res.status(500).json({ error: "Failed to fetch image from S3" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching pet memorial ", error });
  }
};

export const searcHeroMemorial = async (req: Request, res: Response) => {
  try {
    const [search] = Object.values(req.query);
    const heroes = await Heroes.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        // { description: { $regex: search, $options: "i" } },
      ],
    });

    if (heroes.length === 0) {
      return res.status(404).json({ message: "Hero not found" });
    }

    res.status(200).json(heroes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteHero = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const hero = await Heroes.findById(id);

    if (!hero) {
      return res.status(404).json({ message: "Hero not found" });
    }

    await Heroes.findByIdAndDelete(id);

    res.status(200).json({ message: "Hero deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateHero = async (req: any, res: Response) => {
  try {
    const { id, name, description, dob, dod, author } = req.body;
    if (req.files?.length === 0) {
      const hero = await Heroes.findById(id);
      if (!hero) {
        return res.status(404).json({ message: "Memorial not found" });
      } else {
        if (
          name == hero.name &&
          description == hero.description &&
          dob == hero.dob
        ) {
          return res.status(402).json({ message: "No changes made" });
        } else {
          await Heroes.findByIdAndUpdate(id, {
            name: name,
            description: description,
            dob: dob,
            dod: dod,
          });
          res.status(200).json({ msg: "Hero Updated" });
        }
      }
    } else {
      const fileOrgnName = req.file?.originalname || "";
      const fileName = `uploads/image/Hero/${Date.now()}-${removeSpaces(
        fileOrgnName
      )}`;

      // Upload file to S3
      const uploadParams = {
        Bucket: "vgs-upload",
        Key: fileName,
        Body: req.file?.buffer,
        ContentType: req.file?.mimetype,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      await Heroes.findByIdAndUpdate(id, {
        name: name,
        description: description,
        dob: dob,
        dod: dod,
        image: fileName,
      });

      res.status(200).json({ msg: "Hero Updated" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserByHeroId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const hero = await Heroes.findById(id);

    if (!hero) {
      return res.status(404).json({ message: "Hero not found" });
    }

    const user = await UserModel.findById(hero.author);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}