import { Request, Response } from 'express';
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Stream } from "stream";

// Utils
import { s3Client } from "../util/awsAccess";


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