import { Request, Response } from "express";
import { Heroes } from "../model/heroes";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../util/awsAccess";
import { removeSpaces } from "../util/removeSpace";

import { Stream } from "stream";
import { UserModel } from "../model/user";
import { HeroComment } from "../model/heroComment";
import { checkCommentUsingBadwords } from "../util/commentFilter";
import Filter from "bad-words";
import { FCMModel } from "../model/fcmTokens";
import { sendNotification } from "../middleware/notification";
import { emitCommentUpdate, emitLikeUpdate } from "../util/event";
import config from "../config";
import axios from "axios";
import LikeModel from "../model/like";

const filter = new Filter();

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

// export const createHero = async (req: Request, res: Response) => {
//   try {
//     const { name, age, description, dob, dod, author, relation } = req.body;
//     console.log(req.body);
//     console.log(req.files);

//     if (req.files?.length === 0) {
//       return res.status(406).json({ message: "No image provided" });
//     } else {
//       const fileOrgnName = req.file?.originalname || "";
//       const fileName = `uploads/image/Hero/${Date.now()}-${removeSpaces(
//         fileOrgnName
//       )}`;

//       const uploadParams = {
//         Bucket: "vgs-upload",
//         Key: fileName,
//         Body: req.file?.buffer,
//         ContentType: req.file?.mimetype,
//       };

//       const command = new PutObjectCommand(uploadParams);
//       await s3Client.send(command);

//       if (!name || !age || !description || !dob || !dod || !author) {
//         return res.status(402).json({ message: "All fields are required" });
//       }
//       const heroes = new Heroes({
//         name: name,
//         age: age,
//         description: description,
//         dob: dob,
//         dod: dod,
//         author: author,
//         image: fileName,
//         relation: relation,
//       });

//       await heroes.save();

//       res
//         .status(200)
//         .json({ message: "Hero Memory created successfully", heroes });
//     }
//   } catch (error) {
//     console.error("Error Hero Memorial:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

export const createHero = async (req: Request, res: Response) => {
  try {
    const {
      name,
      age,
      description,
      dob,
      dod,
      author,
      relation,
      memorialNote,
      tombstone,
    } = req.body;
    console.log(req.body);
    console.log(req.files);

    if (req.files?.length === 0) {
      return res.status(406).json({ message: "No image provided" });
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

      if (!name || !age || !description || !dob || !dod || !author) {
        return res.status(402).json({ message: "All fields are required" });
      }
      // const url = coverImage[0].url;

      if (tombstone == "true") {
        const HeroesMemorial = new Heroes({
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

        await HeroesMemorial.save();

        res.status(200).json({
          message: "Heroes Memory created successfully",
          HeroesMemorial,
        });
      } else {
        const HeroesMemorial = new Heroes({
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

        await HeroesMemorial.save();

        res.status(200).json({
          message: "Heroes Memory created successfully",
          HeroesMemorial,
        });
      }
    }
  } catch (error) {
    console.error("Error Heroes Memorial:", error);
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

export const deleteHeroComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const hero = await HeroComment.findById(id);

    if (!hero) {
      return res.status(404).json({ message: "Hero comment not found" });
    }

    await HeroComment.findByIdAndDelete(id);

    res.status(200).json({ message: "Hero comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// export const updateHero = async (req: any, res: Response) => {
//   try {
//     const { id, name, description, dob, dod, author } = req.body;
//     if (req.files?.length === 0) {
//       const hero = await Heroes.findById(id);
//       if (!hero) {
//         return res.status(404).json({ message: "Memorial not found" });
//       } else {
//         if (
//           name == hero.name &&
//           description == hero.description &&
//           dob == hero.dob
//         ) {
//           return res.status(402).json({ message: "No changes made" });
//         } else {
//           await Heroes.findByIdAndUpdate(id, {
//             name: name,
//             description: description,
//             dob: dob,
//             dod: dod,
//           });
//           res.status(200).json({ msg: "Hero Updated" });
//         }
//       }
//     } else {
//       const fileOrgnName = req.file?.originalname || "";
//       const fileName = `uploads/image/Hero/${Date.now()}-${removeSpaces(
//         fileOrgnName
//       )}`;

//       // Upload file to S3
//       const uploadParams = {
//         Bucket: "vgs-upload",
//         Key: fileName,
//         Body: req.file?.buffer,
//         ContentType: req.file?.mimetype,
//       };

//       const command = new PutObjectCommand(uploadParams);
//       await s3Client.send(command);

//       await Heroes.findByIdAndUpdate(id, {
//         name: name,
//         description: description,
//         dob: dob,
//         dod: dod,
//         image: fileName,
//       });

//       res.status(200).json({ msg: "Hero Updated" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

export const updateHero = async (req: any, res: Response) => {
  try {
    const { id, name, description, dob, dod, note, author } = req.body;

    if (!req.file) {
      const heroesMemorial = await Heroes.findById(id);
      if (!heroesMemorial) {
        return res.status(404).json({ message: "Heroes not found" });
      } else {
        if (
          name == heroesMemorial.name &&
          description == heroesMemorial.description &&
          dob == heroesMemorial.dob &&
          note == heroesMemorial.memorialNote
        ) {
          return res.status(402).json({ message: "No changes made" });
        } else {
          await Heroes.findByIdAndUpdate(id, {
            name: name,
            description: description,
            dob: dob,
            dod: dod,
            memorialNote: note,
          });
          res.status(200).json({ msg: "Heroes Updated" });
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
        memorialNote: note,
      });

      res.status(200).json({ msg: "Heroes Updated" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateHeroesNote = async (req: any, res: Response) => {
  try {
    const { note, heroesId } = req.body;

    if (!note || !heroesId) {
      res.status(400).json({ Msg: "field required" });
    }

    const heroesMemorial = await Heroes.findById(heroesId);

    if (!heroesMemorial) {
      res.status(400).json({ Msg: "Heroes not found" });
    }

    await Heroes.findByIdAndUpdate(heroesId, {
      memorialNote: note,
    });
    res.status(200).json({ msg: "Heroes Updated" });
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
};

export const createHeroesComment = async (req: Request, res: Response) => {
  try {
    const { content, memorialId, userId } = req.body;

    const memorial = await Heroes.findById(memorialId);

    if (!content || !memorialId || !userId) {
      return res.status(400).json({ error: "content and userId are required" });
    }
    let user = await UserModel.findById(userId);
    const comment = new HeroComment({
      authorId: memorial!.author,
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
        const newComment = await comment.save();
        const commentId = newComment._id;
        await Heroes.findByIdAndUpdate(memorialId, { $inc: { comments: 1 } });
        const memo = await Heroes.findById(memorialId);
        const sender = user?._id?.toString();
        const reciver = memo?.author.toString();
        if (memo && sender !== reciver) {
          const authorTokens = await FCMModel.find({ userId: memo.author });

          for (const tokenData of authorTokens) {
            const payload = {
              title: "Your hero got new comment!",
              body: `${user?.firstName} ${user?.lastName} commented on your hero.`,

              data: {
                fromid: user?._id?.toString(),
                toid: memo.author.toString(),
                type: "Hero-memorial-comment",
                memorialid: memorialId.toString(),
                commentid: commentId?.toString(),
              },
            };
            await sendNotification({ token: tokenData.token, payload });
          }
          await emitCommentUpdate(
            memo.author,
            `${user?.firstName} ${user?.lastName} commented on your Hero.`,
            "Hero comment ",
            userId,
            memorialId
          );
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

export const countHeroComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const Hero: any = await Heroes.find({
      _id: id,
    });

    res.status(200).json({ comment: Hero[0].comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const getAllHeroComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const comments = await HeroComment.find({
      memorialId: id,
    });

    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const translateHeroComment = async (req: Request, res: Response) => {
  const text = req.body.text;
  const targetLanguage: string = "en";

  const apiKey = config.Google_translate;

  const apiUrl: string = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=${encodeURIComponent(
    text
  )}&target=${targetLanguage}`;

  await axios
    .post(apiUrl)
    .then((response) => {
      res.status(200).json({
        translate: response.data.data.translations[0].translatedText,
        lan: "eng",
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      res.status(403).json({
        error,
      });
    });
};

export const likeHeroComment = async (req: Request, res: Response) => {
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

      await HeroComment.findByIdAndUpdate(postId, { $inc: { likes: -1 } });

      return res
        .status(200)
        .json({ like: false, message: "Comment unliked successfully" });
    } else {
      const like = new LikeModel({
        postId: postId,
        Lname: user?.firstName + " " + user?.lastName,
        likerId: likerId,
      });

      const newLike = await like.save();
      const likeID = newLike._id;

      await HeroComment.findByIdAndUpdate(postId, { $inc: { likes: 1 } });

      const memo = await HeroComment.findById(postId);
      const memopost = await HeroComment.findById(memo?.memorialId);
      console.log(memo);
      // console.log(memopost);
      const reciver = memo?.userId.toString();
      const sender = user?._id?.toString();
      if (memo && sender !== reciver) {
        const authorTokens = await FCMModel.find({ userId: memo?.userId });
        console.log(authorTokens);
        for (const tokenData of authorTokens) {
          const payload = {
            title: "Your comment got a new like!",
            body: `${user?.firstName} ${user?.lastName} liked your comment.`,

            data: {
              fromid: user?._id?.toString(),
              toid: memo?.userId.toString(),
              type: "memorial-comment-like",
              memorialid: memo?.memorialId.toString(),
              likeid: likeID?.toString(),
            },
          };
          await sendNotification({ token: tokenData.token, payload });
        }

        await emitLikeUpdate(
          memo?.userId,
          `${user?.firstName} ${user?.lastName} liked your comment.`,
          "Memorial comment Like",
          likerId,
          memo?.memorialId
        );
      }
      return res
        .status(200)
        .json({ like: true, message: "Comment liked successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const searchHeroMemorial = async (req: Request, res: Response) => {
  try {
    const [search] = Object.values(req.query);
    const humanMemorial = await Heroes.find({
      $or: [{ name: { $regex: search, $options: "i" } }],
    });

    if (humanMemorial.length === 0) {
      return res.status(404).json({ message: "Hero not found" });
    }

    res.status(200).json(humanMemorial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
