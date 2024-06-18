import e, { Request, Response } from "express";
import { HumanMemorial } from "../model/humanMemorial";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../util/awsAccess";
import { removeSpaces } from "../util/removeSpace";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Stream } from "stream";

export const getAllHumanMemorial = async (req: any, res: Response) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;


    const allhumanMemorials = await HumanMemorial.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await HumanMemorial.countDocuments();

    res.status(200).json({
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
      memorials: allhumanMemorials
    });

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
};

export const createHumanMemorial = async (req: Request, res: Response) => {
  try {
    const { name, age, description, dob, dod, author, relation, memorialNote, tombstone } = req.body;
    console.log(req.body);
    console.log(req.files);

    if (req.files?.length === 0) {
      return res.status(406).json({ message: "No image provided" });
    } else {
      // const coverImage = (req.files as Express.Multer.File[]).map(
      //   (file: Express.Multer.File) => ({
      //     url: file.path,
      //   })
      // );

      const fileOrgnName = req.file?.originalname || "";
      const fileName = `uploads/image/human/${Date.now()}-${removeSpaces(fileOrgnName)}`;

      // Upload file to S3
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
      // const url = coverImage[0].url;

      if (tombstone == "true") {
        const humanMemorial = new HumanMemorial({
          name: name,
          age: age,
          description: description,
          dob: dob,
          dod: dod,
          author: author,
          image: fileName,
          memorialNote: memorialNote,
          relation: relation,
          tombstone: true,
          tombstoneId: req.body.tombstoneId,
        });

        await humanMemorial.save();

        res
          .status(200)
          .json({ message: "Human Memory created successfully", humanMemorial });
      } else {
        const humanMemorial = new HumanMemorial({
          name: name,
          age: age,
          description: description,
          dob: dob,
          dod: dod,
          author: author,
          memorialNote: memorialNote,
          image: fileName,
          relation: relation,
        });

        await humanMemorial.save();

        res
          .status(200)
          .json({ message: "Human Memory created successfully", humanMemorial });
      }

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
      // res.set({
      //   "Content-Type": "image/*",
      // });

      Body.pipe(res);
    } else {
      res.status(500).json({ error: "Failed to fetch image from S3" });
    }

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
};

export const searchHumanMemorial = async (req: Request, res: Response) => {
  try {
    const [search] = Object.values(req.query);
    const humanMemorial = await HumanMemorial.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        // { description: { $regex: search, $options: "i" } },
      ],
    });

    if (humanMemorial.length === 0) {
      return res.status(404).json({ message: "Memorial not found" });
    }

    res.status(200).json(humanMemorial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteHumanMemorial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const humanMemorial = await HumanMemorial.findById(id);

    if (!humanMemorial) {
      return res.status(404).json({ message: "Memorial not found" });
    }

    await HumanMemorial.findByIdAndDelete(id);

    res.status(200).json({ message: "Memorial deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const updateHumanMemorial = async (req: any, res: Response) => {
  try {
    const { id, name, description, dob, dod, author } = req.body;
    if (req.files?.length === 0) {
      const humanMemorial = await HumanMemorial.findById(id);
      if (!humanMemorial) {
        return res.status(404).json({ message: "Memorial not found" });
      } else {
        if (
          name == humanMemorial.name &&
          description == humanMemorial.description &&
          dob == humanMemorial.dob
        ) {
          return res.status(402).json({ message: "No changes made" });
        } else {
          await HumanMemorial.findByIdAndUpdate(id, {
            name: name,
            description: description,
            dob: dob,
            dod: dod,
          });
          res.status(200).json({ msg: "Memorial Updated" });
        }
      }
    } else {
      const fileOrgnName = req.file?.originalname || "";
      const fileName = `uploads/image/human/${Date.now()}-${removeSpaces(fileOrgnName)}`;

      // Upload file to S3
      const uploadParams = {
        Bucket: "vgs-upload",
        Key: fileName,
        Body: req.file?.buffer,
        ContentType: req.file?.mimetype,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      await HumanMemorial.findByIdAndUpdate(id, {
        name: name,
        description: description,
        dob: dob,
        dod: dod,
        image: fileName,
      });

      res.status(200).json({ msg: "Memorial Updated" });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
