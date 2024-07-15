import { Request, Response } from "express";

// Models
import { DonationModel } from "../model/donation";
import { UserModel } from "../model/user";
import { FlowerDonationModel } from "../model/flowerDonation";
import { DonationNonUserModel } from "../model/donationNonUser";
import { MemorialComment } from "../model/memorialComment";
import { HumanMemorial } from "../model/humanMemorial";
import { PetMemorialComment } from "../model/petMemorialComment";

export const fetchComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const comments = [];

    const donation: any = await DonationModel.find({ to: id });
    const nonUserDonation = await DonationNonUserModel.find({ to: id });
    const flower: any = await FlowerDonationModel.find({ to: id });
    const memorialComment: any = await MemorialComment.find({ memorialId: id });

    if (donation) {
      for (let i = 0; i < donation.length; i++) {
        const user = await UserModel.findOne({ _id: donation[i].from });

        if (!user) {
          comments.push({
            id: donation[i]._id,
            name: donation[i].name,
            note: donation[i].note,
            type: "donation",
            blocked: donation[i].blocked,
            date: donation[i].createdAt,
            likes: donation[i].likes,
            creator: donation[i].from // new the one who commented Id
          });
        } else {
          comments.push({
            id: donation[i]._id,
            name: user!.firstName + " " + user!.lastName,
            note: donation[i].note,
            type: "donation",
            blocked: donation[i].blocked,
            date: donation[i].createdAt,
            likes: donation[i].likes,
            creator: donation[i].from
          });
        }
      }
    }

    if (flower) {
      for (let i = 0; i < flower.length; i++) {
        const user = await UserModel.findOne({ _id: flower[i].from });

        if (!user) {
          comments.push({
            id: flower[i]._id,
            name: flower[i].name,
            note: flower[i].note,
            type: "flower-donation",
            blocked: flower[i].blocked,
            date: flower[i].createdAt,
            likes: flower[i].likes,
            creator: flower[i].from
          });
        } else {
          comments.push({
            id: flower[i]._id,
            name: user!.firstName + " " + user!.lastName,
            note: flower[i].note,
            type: "flower-donation",
            blocked: flower[i].blocked,
            date: flower[i].createdAt,
            likes: flower[i].likes,
            creator: flower[i].from
          });
        }
      }
    }

    if (nonUserDonation) {
      for (let i = 0; i < nonUserDonation.length; i++) {
        comments.push({
          id: nonUserDonation[i]._id,
          name: nonUserDonation[i].name,
          note: nonUserDonation[i].note,
          type: "non-user-donation",
          blocked: nonUserDonation[i].blocked,
          date: nonUserDonation[i].createdAt,
        });
      }
    }

    if (memorialComment) {
      for (let i = 0; i < memorialComment.length; i++) {
        const user = await UserModel.findOne({
          _id: memorialComment[i].userId,
        });
        comments.push({
          id: memorialComment[i]._id,
          name: memorialComment[i].cname,
          note: memorialComment[i].comment,
          type: "comment",
          blocked: memorialComment[i].blocked,
          date: memorialComment[i].createdAt,
          likes: memorialComment[i].likes,
          creator: memorialComment[i].userId
        });
      }
    }

    res.status(200).json({
      comments: comments.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", msg: error });
  }
};

export const blockComment = async (req: Request, res: Response) => {
  try {
    const { userId, commentId, type } = req.body;

    const user = await UserModel.findOne({ _id: userId });

    switch (type) {
      case "donation":
        const donation = await DonationModel.findOne({ _id: commentId });
        const donationMemorial = await HumanMemorial.findOne({
          _id: donation!.to,
        });

        if (userId != donationMemorial!.author) {
          return res.status(402).json({ message: "Unauthorized" });
        }

        if (!donation) {
          return res.status(404).json({ message: "Donation not found" });
        }

        await DonationModel.updateOne({ _id: commentId }, { blocked: true });

        res
          .status(200)
          .json({ donation: donation, message: "Donation blocked" });

        break;
      case "flower-donation":
        const flower = await FlowerDonationModel.findById(commentId);
        const flowerMemorial = await HumanMemorial.findById(flower!.to);

        if (userId != flowerMemorial!.author) {
          return res.status(402).json({ message: "Unauthorized" });
        }

        if (!flower) {
          return res.status(404).json({ message: "Flower donation not found" });
        }

        await FlowerDonationModel.updateOne(
          { _id: commentId },
          { blocked: true }
        );

        res
          .status(200)
          .json({ donation: flower, message: "Flower donation blocked" });

        break;
      case "non-user-donation":
        const nonUserDonation = await DonationNonUserModel.findOne({
          _id: commentId,
        });
        const nonUserMemorial = await HumanMemorial.findOne({
          _id: nonUserDonation!.to,
        });

        if (userId != nonUserMemorial!.author) {
          return res.status(402).json({ message: "Unauthorized" });
        }

        if (!nonUserDonation) {
          return res
            .status(404)
            .json({ message: "Non user donation not found" });
        }

        await DonationNonUserModel.updateOne(
          { _id: commentId },
          { blocked: true }
        );

        res.status(200).json({
          comment: nonUserDonation,
          message: "Non user donation blocked",
        });
        break;
      case "comment":
        const comment = await MemorialComment.findOne({ _id: commentId });

        if (userId != comment!.userId) {
          return res.status(402).json({ message: "Unauthorized" });
        }

        if (!comment) {
          return res.status(404).json({ message: "Comment not found" });
        }

        await MemorialComment.updateOne({ _id: commentId }, { blocked: true });

        res.status(200).json({ comment: comment, message: "Comment blocked" });

        break;
      default:
        res.status(400).json({ message: "Invalid type" });
        break;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unblockComment = async (req: Request, res: Response) => {
  try {
    const { userId, commentId, type } = req.body;

    const user = await UserModel.findOne({ _id: userId });

    switch (type) {
      case "donation":
        const donation = await DonationModel.findOne({ _id: commentId });
        const donationMemorial = await HumanMemorial.findOne({
          _id: donation!.to,
        });

        if (userId != donation!.from) {
          return res.status(402).json({ message: "Unauthorized" });
        }

        if (!donation) {
          return res.status(404).json({ message: "Donation not found" });
        }

        await DonationModel.updateOne({ _id: commentId }, { blocked: false });

        res
          .status(200)
          .json({ donation: donation, message: "Donation Comment Unblocked" });

        break;
      case "flower-donation":
        const flower = await FlowerDonationModel.findById(commentId);
        const flowerMemorial = await HumanMemorial.findById(flower!.to);

        if (userId != flowerMemorial!.author) {
          return res.status(402).json({ message: "Unauthorized" });
        }

        if (!flower) {
          return res.status(404).json({ message: "Flower donation not found" });
        }

        await FlowerDonationModel.updateOne(
          { _id: commentId },
          { blocked: false }
        );

        res.status(200).json({
          donation: flower,
          message: "Flower donation Comment Unblocked",
        });

        break;
      case "non-user-donation":
        const nonUserDonation = await DonationNonUserModel.findOne({
          _id: commentId,
        });
        const nonUserMemorial = await HumanMemorial.findOne({
          _id: nonUserDonation!.to,
        });

        if (userId != nonUserMemorial!.author) {
          return res.status(402).json({ message: "Unauthorized" });
        }

        if (!nonUserDonation) {
          return res
            .status(404)
            .json({ message: "Non user donation not found" });
        }

        await DonationNonUserModel.updateOne(
          { _id: commentId },
          { blocked: false }
        );

        res.status(200).json({
          comment: nonUserDonation,
          message: "Non user donation Comment Unblocked",
        });
        break;
      case "comment":
        const comment = await MemorialComment.findOne({ _id: commentId });

        if (userId != comment!.userId) {
          return res.status(402).json({ message: "Unauthorized" });
        }

        if (!comment) {
          return res.status(404).json({ message: "Comment not found" });
        }

        await MemorialComment.updateOne({ _id: commentId }, { blocked: false });

        res
          .status(200)
          .json({ comment: comment, message: "Comment Unblocked" });

        break;
      default:
        res.status(400).json({ message: "Invalid type" });
        break;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const editMemorialComment = async (req: Request, res: Response) => {
  const { authorID, commentId, type, note } = req.body;
  try {
    let memorial = await MemorialComment.find({
      userId: authorID,
      _id: commentId,
    });

    if (!memorial) {
      return res.status(400).json({ message: "You are not the author" });
    }
    let memoriaID = await MemorialComment.findByIdAndUpdate(commentId, {
      comment: note,
    });

    res.status(200).json({ message: "Comment edited" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const editDonationComment = async (req: Request, res: Response) => {
  const { authorID, commentId, type, note } = req.body;
  try {
    let memorial = await DonationModel.findById(commentId);

    if (memorial?.from?.toString() !== authorID) {
      return res.status(400).json({ message: "You are not the author" });
    }
    let memoriaID = await DonationModel.findByIdAndUpdate(commentId, {
      note: note,
    });

    res.status(200).json({ message: "Comment edited" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const editPetMemorialComment = async (req: Request, res: Response) => {
  const { authorID, commentId, type, note } = req.body;
  try {
    let memorial = await PetMemorialComment.find({
      userId: authorID,
      _id: commentId,
    });

    if (!memorial) {
      return res.status(400).json({ message: "You are not the author" });
    }
    let memoriaID = await PetMemorialComment.findByIdAndUpdate(commentId, {
      comment: note,
    });

    res.status(200).json({ message: "Comment edited" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const editFlowerDonationComment = async (
  req: Request,
  res: Response
) => {
  const { authorID, commentId, type, note } = req.body;
  try {
    let memorial = await FlowerDonationModel.findById(commentId);

    if (memorial?.from.toString() !== authorID) {
      return res.status(400).json({ message: "You are not the author" });
    }
    let memoriaID = await FlowerDonationModel.findByIdAndUpdate(commentId, {
      note: note,
    });

    res.status(200).json({ message: "Comment edited" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const deleteMemorialComment = async (req: Request, res: Response) => {
  const { authorID, commentId, type, note } = req.body;
  try {
    let memorial = await MemorialComment.find({
      userId: authorID,
      _id: commentId,
    });

    if (!memorial) {
      return res.status(400).json({ message: "You are not the author" });
    }
    let memoriaID = await MemorialComment.findByIdAndUpdate(commentId, {
      comment: "",
    });

    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteDonationComment = async (req: Request, res: Response) => {
  const { authorID, commentId, type } = req.body;
  try {
    let memorial = await DonationModel.findById(commentId);

    if (memorial?.from?.toString() !== authorID) {
      return res.status(400).json({ message: "You are not the author" });
    }
    let memoriaID = await DonationModel.findByIdAndUpdate(commentId, {
      note: "",
    });

    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteFlowerDonationComment = async (
  req: Request,
  res: Response
) => {
  const { authorID, commentId, type, note } = req.body;
  try {
    let memorial = await FlowerDonationModel.findById(commentId);

    if (memorial?.from.toString() !== authorID) {
      return res.status(400).json({ message: "You are not the author" });
    }
    let memoriaID = await FlowerDonationModel.findByIdAndUpdate(commentId, {
      note: "",
    });

    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};