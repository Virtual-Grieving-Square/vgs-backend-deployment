import { Request, Response } from 'express';
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Stream } from "stream";

import { PutObjectCommand } from "@aws-sdk/client-s3";

// Utils
import { s3Client } from "../util/awsAccess";
import { removeSpaces } from '../util/removeSpace';


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
    res.status(500).json({ error: "Failed to get the signed URL" });
  }
};

export const uploadFuneralImage = async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File;

    if (!file) {
      return res.status(400).send("Image is not provided");
    }

    const fileOrgnName = req.file?.originalname || "";
    const fileName = `uploads/image/funeralImages/${Date.now()}-${removeSpaces(fileOrgnName)}`;

    // Upload file to S3
    const uploadParams = {
      Bucket: "vgs-upload",
      Key: fileName,
      Body: req.file?.buffer,
      ContentType: req.file?.mimetype,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);


    res.status(200).json({ image: fileName, message: "Image uploaded successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}