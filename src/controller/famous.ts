import { Response, Request } from "express";
import FamousPeopleModel, {
  FamousPeopleInterface,
} from "../model/famousPeople";
import { removeSpaces } from "../util/removeSpace";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../util/awsAccess";
import { Stream } from "nodemailer/lib/xoauth2";


export const getAll = async (req: Request, res: Response) => {
  try {
    const famous = await FamousPeopleModel.find();

    res.status(200).json(famous);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getByNumber = async (req: Request, res: Response) => {
  try {
    const { number } = req.params;

    const famous = await FamousPeopleModel.find({ number: number });

    // Fetch Image from S3 Bucket
    const key = famous[0].image;
    const command = new GetObjectCommand({
      Bucket: "vgs-upload",
      Key: key,
    });

    const { Body } = await s3Client.send(command);

    if (Body instanceof Stream) {
      res.set({
        "Content-Type": "image/jpg",
      });

      Body.pipe(res);
    } else {
      res.status(500).json({ error: "Failed to fetch image from S3" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getRandom = async (req: Request, res: Response) => {
  try {
    const famous = await FamousPeopleModel.aggregate([{ $sample: { size: 1 } }]);

    const key = famous[0].image;

    const command = new GetObjectCommand({
      Bucket: "vgs-upload",
      Key: key,
    });

    const { Body } = await s3Client.send(command);

    if (Body instanceof Stream) {
      res.set({
        "Content-Type": "image/jpg",
      });

      Body.pipe(res);
    } else {
      res.status(500).json({ error: "Failed to fetch image from S3" });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export const getRandomByNumber = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const famous = await FamousPeopleModel.aggregate([{ $sample: { size: 1 } }]);

    const key = famous[0].image;

    const command = new GetObjectCommand({
      Bucket: "vgs-upload",
      Key: key,
    });

    const { Body } = await s3Client.send(command);

    if (Body instanceof Stream) {
      res.set({
        "Content-Type": "image/jpg",
      });

      Body.pipe(res);
    } else {
      res.status(500).json({ error: "Failed to fetch image from S3" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const famous = await FamousPeopleModel.findById(id);

    res.status(200).json(famous);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { name, profession, dob, dod } = req.body;
    console.log(req.body);
    let number = 1;

    if (!name || !profession || !dob || !dod) {
      return res
        .status(402)
        .json({ message: "Please fill in all required fields." });
    }

    // Image Upload Logic
    const currentDate = new Date();
    const fileOrgnName = req.file?.originalname || "";
    const fileName = `uploads/image/famous/${Date.now()}-${removeSpaces(
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

    const famous = await FamousPeopleModel.find().sort({ number: -1 }).limit(1);
    const newEntryData = {
      name: name,
      profession: profession,
      dob: dob,
      dod: dod,
      image: fileName,
    };
    const newEntry = new FamousPeopleModel(newEntryData);

    newEntry
      .save()
      .then((savedEntry) => {
        res.status(200).json({ msg: "New entry added", data: savedEntry });
      })
      .catch((error) => {
        res.status(500).json({ msg: "Error adding new entry:", data: error });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getImage = async (req: Request, res: Response) => {
  try {
    const { image } = req.query;

    if (!image) {
      return res.status(400).send("Image name is not provided");
    }

    const key = `${image}`;

    const command = new GetObjectCommand({
      Bucket: "vgs-upload",
      Key: key,
    });


    const { Body } = await s3Client.send(command);

    if (Body instanceof Stream) {
      res.set({
        "Content-Type": "image/jpg",
      });

      Body.pipe(res);
    } else {
      res.status(500).json({ error: "Failed to fetch image from S3" });
    }

    console.log(image)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export const deleteData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const famous = await FamousPeopleModel.findByIdAndDelete(id);

    res.status(200).json(famous);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}
