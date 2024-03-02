import { Request, Response } from "express";
import { GroupModel } from "../../model/group";
import { GroupWriting } from "../../model/groupWriting";
import { responseEncoding } from "axios";
import { GroupComment } from "../../model/groupComments";
import { checkCommentUsingSapling } from "../../util/commentFilter";
import { UserModel } from "../../model/user";

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, description, userId } = req.body;

    if (!name || !description || !userId) {
      return res
        .status(400)
        .json({ message: "Name, description, and userId are required" });
    }

    const group = new GroupModel({
      name,
      description,
      creator: userId,
      members: [userId],
    });

    await group.save();

    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addGroupMembers = async (req: Request, res: Response) => {
  try {
    const { groupId, members } = req.body;

    if (!groupId || !members || !Array.isArray(members)) {
      return res
        .status(400)
        .json({ message: "groupId and an array of members are required" });
    }

    const group: any = await GroupModel.findById(groupId);

    members.forEach((memberId) => {
      if (!group.members.includes(memberId)) {
        group.members.push(memberId);
      }
    });

    await group.save();

    res.status(200).json({ message: "Members added successfully", group });
  } catch (error) {
    console.error("Error adding group members:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addComments = async (req: Request, res: Response) => {
  try {
    const { groupId, writingId } = req.params;
    const { userId, content } = req.body;

    if (!groupId || !writingId || !userId || !content) {
      return res
        .status(400)
        .json({
          message: "groupId, writingId, userId, and content are required",
        });
    }
    const isCommentInappropriate = await checkCommentUsingSapling(content);

    if (isCommentInappropriate) {
      try {
        const user = await UserModel.findById(userId);

        if (user) {
          if (user.blacklistCount < 2) {
            user.blacklistCount += 1;
            await user.save();
            return res
              .status(400)
              .json({ error: "Inappropriate writing detected", flag: user.blacklistCount });
          } else if (user.blacklistCount === 2) {
            user.blacklistCount += 1;

            user.flag = "suspended";
            await user.save();
            return res
              .status(400)
              .json({
                error: "Inappropriate comment detected and account suspended",
              });
          }
        }
      } catch (error) {
        console.error("Error updating user blacklist count:", error);
      }
    }

    const comment = new GroupComment({
      groupId,
      writingId,
      userId,
      content,
    });

    await comment.save();

    res
      .status(201)
      .json({ message: "Comment added to the writing successfully", comment });
  } catch (error) {
    console.error("Error adding comment to writing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createGallery = async (req: Request, res: Response) => {
  try {
    const imagePaths = (req.files as Express.Multer.File[]).map(
      (file: Express.Multer.File) => ({
        url: file.path,
      })
    );

    const groupId = req.body.groupId;
    const group = await GroupModel.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    group.gallery.push(...imagePaths);

    await group.save();

    return res
      .status(200)
      .json({ message: "Gallery created successfully", group });
  } catch (error) {
    console.error("Error creating gallery:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const groupWriting = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { userId, content } = req.body;

    if (!groupId || !userId || !content) {
      return res
        .status(400)
        .json({ message: "groupId, userId, and content are required" });
    }

    const isWrittingInappropriate = await checkCommentUsingSapling(content);

    if (isWrittingInappropriate) {
      try {
        const user = await UserModel.findById(userId);

        if (user) {
          if (user.blacklistCount < 2) {
            user.blacklistCount += 1;
            await user.save();
            return res
              .status(400)
              .json({ error: "Inappropriate writing detected" });
          } else if (user.blacklistCount === 2) {
            user.blacklistCount += 1;

            user.flag = "suspended";
            await user.save();
            return res
              .status(400)
              .json({
                error: "Inappropriate writing detected and account suspended",
              });
          }
        }
      } catch (error) {
        console.error("Error updating user blacklist count:", error);
      }
    } else {
      const groupWriting = new GroupWriting({
        groupId,
        userId,
        content,
      });

      await groupWriting.save();

      res.status(201).json({
        message: "Writing added to the group successfully",
        groupWriting,
      });
    }
  } catch (error) {
    console.error("Error adding writing to group:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGalleryByGroupId = async (req: Request, res: Response) => {
  try {
    const groupId = req.params.groupId;

    const group = await GroupModel.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const gallery = group.gallery;

    return res
      .status(200)
      .json({ message: "Group gallery retrieved successfully", gallery });
  } catch (error) {
    console.error("Error retrieving group gallery:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
