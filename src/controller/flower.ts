import { Request, Response } from 'express';
import { removeSpaces } from '../util/removeSpace';
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../util/awsAccess";
import FlowerModel from '../model/flowers';
import { Stream } from "stream";

export const addFlower = async (req: Request, res: Response) => {
  try {
    const { name, description, price, type } = req.body;

    if (!name || !description || !price || !type) {
      return res.status(400).json({ message: "All fields are required" });
    } else {

      const fileOriginName = req.file?.originalname || "";
      const fileName = `uploads/image/flower/${Date.now()}-${removeSpaces(fileOriginName)}`;

      // Upload file to S3
      const uploadParams = {
        Bucket: "vgs-upload",
        Key: fileName,
        Body: req.file?.buffer,
        ContentType: req.file?.mimetype,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      const flower = new FlowerModel({
        name: name,
        description: description,
        price: price,
        photos: fileName,
        type: type,
      });

      await flower.save();

      res.status(200).json(flower);

    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export const getFlowers = async (req: Request, res: Response) => {
  try {
    const flowers = await FlowerModel.find();

    if (!flowers) {
      return res.status(404).json({ message: "Flowers not found" });
    }

    res.status(200).json(flowers);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export const getImage = async (req: Request, res: Response) => {
  try {
    const name = req.query.name as string | undefined;

    if (!name) {
      return res.status(400).send("Image name is not provided");
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
    console.error(error);
  }
}

export const deleteFlower = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const flower = await FlowerModel.findByIdAndDelete(id);

    if (!flower) {
      return res.status(404).json({ message: "Flower not found" });
    }

    res.status(200).json({ message: "Flower deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}