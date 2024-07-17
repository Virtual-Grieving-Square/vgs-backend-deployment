import { Request, Response } from "express";
import { PetMemorial } from "../model/petMemorial";
import { removeSpaces } from "../util/removeSpace";
import {
  GetObjectCommand,
  PutObjectCommand
} from "@aws-sdk/client-s3";
import { s3Client } from "../util/awsAccess";
import { Stream } from "stream";
import { UserModel } from "../model/user";
import { PetMemorialComment } from "../model/petMemorialComment";
import { checkCommentUsingBadwords } from "../util/commentFilter";
import Filter from "bad-words";
import { FCMModel } from "../model/fcmTokens";
import { sendNotification } from "../middleware/notification";
import { emitCommentUpdate, emitLikeUpdate } from "../util/event";
import LikeModel from "../model/like";

const filter = new Filter();

export const getAllPetMemorial = async (req: any, res: Response) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const allpetMemorials = await PetMemorial.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await PetMemorial.countDocuments();

    res.status(200).json({
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
      memorials: allpetMemorials
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPetById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const pet = await PetMemorial.findById(id);
    res.status(200).json(pet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const createPetMemorial = async (req: Request, res: Response) => {
  try {
    const { name, age, type, dob, dod, author, description } = req.body;
    const owner = author;
    console.log(req.files);
    console.log(req.body);

    if (req.files?.length === 0) {
      return res.status(406).json({ message: "No image provided" });
    } else {
      // const coverImage = (req.files as Express.Multer.File[]).map(
      //   (file: Express.Multer.File) => ({
      //     url: file.path,
      //   })
      // );
      const fileOrgnName = req.file?.originalname || "";
      const fileName = `uploads/image/Memorial/PetMemorial/${Date.now()} -${removeSpaces(fileOrgnName)}`;

      // Upload file to S3
      const uploadParams = {
        Bucket: "vgs-upload",
        Key: fileName,
        Body: req.file?.buffer,
        ContentType: req.file?.mimetype,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      if (!name || !age || !type || !dob || !dod || !owner) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // const url = coverImage[0].url;
      const petMemorial = new PetMemorial({
        name: name,
        age: age,
        type: type,
        DOB: dob,
        DOD: dod,
        owner: owner,
        description: description,
        coverImage: fileName,
      });

      await petMemorial.save();

      res
        .status(200)
        .json({ message: "Pet Memory created successfully", petMemorial });
    }
  } catch (error) {
    console.error("Error creating pet memorials:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePetMemorial = async (req: any, res: Response) => {
  try {
    const { id, name, description, dob, dod, note, author } = req.body;

    if (!req.file) {
      const petMemorial = await PetMemorial.findById(id);
      if (!petMemorial) {
        return res.status(404).json({ message: "Memorial not found" });
      } else {
        if (
          name == petMemorial.name &&
          description == petMemorial.description &&
          dob == petMemorial.DOB &&
          note == petMemorial.petmemorialNote
        ) {
          return res.status(402).json({ message: "No changes made" });
        } else {
          await PetMemorial.findByIdAndUpdate(id, {
            name: name,
            description: description,
            DOB: dob,
            DOD: dod,
            petmemorialNote: note,
          });
          res.status(200).json({ msg: "Memorial Updated" });
        }
      }
    } else {
      const fileOrgnName = req.file?.originalname || "";
      const fileName = `uploads/image/Memorial/PetMemorial/${Date.now()}-${removeSpaces(
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

      await PetMemorial.findByIdAndUpdate(id, {
        name: name,
        description: description,
        DOB: dob,
        DOD: dod,
        coverImage: fileName,
        memorialNote: note,
      });

      res.status(200).json({ msg: "Memorial Updated" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePetNote = async (req: any, res: Response) => {
  try {
    const { note, memorialId } = req.body;

    if (!note || !memorialId) {
      res.status(400).json({ Msg: "field required" });
    }

    const petMemorial = await PetMemorial.findById(memorialId);

    if (!petMemorial) {
      res.status(400).json({ Msg: "memorial not found" });
    }

    await PetMemorial.findByIdAndUpdate(memorialId, {
      petmemorialNote: note,
    });
    res.status(200).json({ msg: "Memorial Updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createPetMemorialComment = async (req: Request, res: Response) => {
  try {
    const { content, memorialId, userId } = req.body;

    const memorial = await PetMemorial.findById(memorialId);

    if (!content || !memorialId || !userId) {
      return res.status(400).json({ error: "content and userId are required" });
    }
    let user = await UserModel.findById(userId);
    const comment = new PetMemorialComment({
      authorId: memorial!.owner,
      cname: user?.firstName + " " + user?.lastName,
      comment: content,
      memorialId: memorialId,
      userId: userId,
    });

    // Check if the comment contains bad words from library
    const response: any = filter.isProfane(content);
    const response2: any = await checkCommentUsingBadwords(content);

    if (user) {
      var strike = user.blacklistCount;
      console.log("Strike", strike);

      if (filter.isProfane(content) || response2) {
        try {
          if (strike < 2) {
            user.blacklistCount += 1;
            await user.save();
            return res.status(402).json({
              error: "Inappropriate comment detected",
              msg: "inappropriate_comment_detected",
              banMessage: "Inappropriate comment detected",
            });
          } else {
            user.blacklistCount += 1;
            user.banCount += 1;

            let now = new Date();
            let banPeriod = 24 * 60 * 60 * 1000; // 24 hours

            if (user.banCount == 2) {
              banPeriod = 48 * 60 * 60 * 1000; // 48 hours
            } else if (user.banCount > 2) {
              banPeriod = 48 * 60 * 60 * 1000; // 48 hours
              user.flag = "BAN";
            }

            user.flag = user.banCount > 2 ? "BAN" : "suspended";
            user.banExpiry = new Date(now.getTime() + banPeriod);
            await user.save();

            let banMessage =
              user.banCount > 2
                ? "Inappropriate comment detected and account banned. You can't comment anymore"
                : `Inappropriate comment detected and account suspended for ${
                    banPeriod / (60 * 60 * 1000)
                  } Hr`;

            return res.status(402).json({
              error: banMessage,
              banMessage: banMessage,
              msg: user.banCount > 2 ? "account_banned" : "account_suspended",
            });
          }
        } catch (error) {
          console.error("Error updating user blacklist count:", error);
        }
      }

      if (strike > 2) {
        return res.status(402).json({
          error: "Account Suspended",
          msg: "account_suspended",
          banMessage: "Account Suspended for Bad Comment",
        });
      } else {
        await comment.save();
        // await Memorial.findByIdAndUpdate(memorialId, { $inc: { comments: 1 } });
        const memo = await PetMemorial.findById(memorialId);
        if (memo) {
          const authorTokens = await FCMModel.find({ userId: memo.owner });

          for (const tokenData of authorTokens) {
            const payload = {
              title: "Your Memorial got new comment!",
              body: `${user?.firstName} ${user?.lastName} commented on your memorial.`,
              data: {},
            };
            await sendNotification({ token: tokenData.token, payload });
            await emitCommentUpdate(memo.owner, `${user?.firstName} ${user?.lastName} commented on your memorial.`,
              "Pet Memorial comment ",
              userId
            )
          }
        }
        res.status(200).json({
          msg: "comment_created_successfully",
          message: "Comment created successfully",
          comment,
        });
      }
    }
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likePetComment = async (req: Request, res: Response) => {
  try {
    const { postId, likerId } = req.body;

    const likes = await LikeModel.find({
      postId: postId,
      likerId: likerId,
    });
    let user = await UserModel.findById(likerId);

    if (likes.length > 0) {
      await LikeModel.deleteMany({
        postId: postId,
        likerId: likerId,
      });

      await PetMemorialComment.findByIdAndUpdate(postId, { $inc: { likes: -1 } });

      return res
        .status(200)
        .json({ like: false, message: "Comment unliked successfully" });
    } else {
      const like = new LikeModel({
        postId: postId,
        Lname: user?.firstName + " " + user?.lastName,
        likerId: likerId,
      });

      await like.save();

      await PetMemorialComment.findByIdAndUpdate(postId, { $inc: { likes: 1 } });

      const memo = await PetMemorialComment.findById(postId);
      console.log(memo);
      // console.log(memopost);
      if (memo) {
        const authorTokens = await FCMModel.find({ userId: memo?.userId });
        console.log(authorTokens);
        for (const tokenData of authorTokens) {
          const payload = {
            title: "Your comment got a new like!",
            body: `${user?.firstName} ${user?.lastName} liked your comment.`,
            data: { postId: postId.toString(), likerId: likerId.toString() },
          };
          await sendNotification({ token: tokenData.token, payload });
        }
      }
      await emitLikeUpdate(memo?.userId, `${user?.firstName} ${user?.lastName} liked your comment.`,  "Pet Memorial comment Like",
        likerId)
      return res
        .status(200)
        .json({ like: true, message: "Comment liked successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePetTombstone = async (req: any, res: Response) => {
  try {
    const { memorialID, tombstoneId } = req.body;

    let memorial = await PetMemorial.findById(memorialID);
    if (!memorial) {
      return res.status(400).json({ msg: "no memory found with that Id" });
    }
    const update = await PetMemorial.findByIdAndUpdate(memorialID, {
      tombstoneId: tombstoneId,
    });

    res.status(200).json({
      tombstone: update,
      message: "Tombstone updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const getPetMemorialByUserId = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const pet = await PetMemorial.find({
      owner: id,
    });

    res.status(200).json(pet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const fetchpetImage = async (req: Request, res: Response) => {
  try {
    const name = req.query.name as string | undefined;

    if (!name) {
      return res.status(400).send("Image name is not provided");
    }

    const key = `${name} `;

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
    console.error(error);

    res.status(500).json({ error: "Failed to get the signed URL" });
  }
};

export const deletePetMemorial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const petMemorial = await PetMemorial.findById(id);

    if (!petMemorial) {
      return res.status(404).json({ message: "Memorial not found" });
    }

    await PetMemorial.findByIdAndDelete(id);

    res.status(200).json({ message: "Memorial deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
} 

// new ones

export const countPetComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const PetMem: any = await PetMemorial.find({
      _id: id,
    });

    res.status(200).json({ comment: PetMem[0].comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};


export const getAllPetMemorialComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const comments = await PetMemorialComment.find({
      _id: id,
    });

    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};