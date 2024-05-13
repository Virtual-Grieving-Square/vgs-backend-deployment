import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import PostModel from "../model/Post";
import { UserModel } from "../model/user";
import * as fs from "fs";
import { s3Client } from "./awsAccess";
import { error } from "console";
// Function to get file stats and size
export async function getFileStats(fileName: string): Promise<number> {
  return new Promise((resolve, reject) => {
    fs.stat(fileName, (err: NodeJS.ErrnoException | null, stats: fs.Stats) => {
      if (err) {
        reject(err);
        return;
      }
      const fileSizeInBytes: number = stats.size;
      const fileSizeInKilobytes: number = fileSizeInBytes / 1024;
      resolve(fileSizeInKilobytes);
    });
  });
}

// Function to get user's storage
export async function getUserStorage(userId: string): Promise<number> {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    console.log(user);
    return user.storage;
  } catch (error) {
    console.error("Error fetching user storage:", error);
    throw error;
  }
}

// Function to check and update user's storage
export function checkuserStorageLimit(
  userStorageLeft: number,
  newStorageSize: number
): { hasEnoughStorage: boolean; difference: number } {
  const difference = userStorageLeft - newStorageSize;
  const hasEnoughStorage = difference >= 0;
  return { hasEnoughStorage, difference };
}

// Function to update user's storage on delete
export async function updateUserStorageOnDelete(
  userId: string,
  storageToAddBack: number
): Promise<void> {
  console.log("to add", storageToAddBack);
  try {
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { storage: storageToAddBack.toFixed(2) },
    });
    console.log("User storage updated successfully on delete.");
  } catch (error) {
    console.error("Error updating user storage on delete:", error);
    throw error;
  }
}

// Function to update user's storage on post
export async function updateUserStorageOnPost(
  userId: string,
  storageToSubtract: number
): Promise<void> {
  try {
    await UserModel.findByIdAndUpdate(userId, {
      storage: storageToSubtract.toFixed(2),
    });
    console.log("User storage updated successfully on post.");
  } catch (error) {
    console.error("Error updating user storage on subtract:", error);
  }
}

export const getImageSize = async (path: string): Promise<number> => {
  try {
    const key = `${path}`;

    const headCommand = new HeadObjectCommand({
      Bucket: "vgs-upload",
      Key: key,
    });

    const { ContentLength } = await s3Client.send(headCommand);

    if (!ContentLength) {
      throw new Error("Image not found in S3");
    }

    return ContentLength / 1024 / 1024;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get image size");
  }
};

async function deleteImageFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: "vgs-upload",
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting image from S3:", error);
    throw error;
  }
}

// Function to update user's storage on Delete
export async function restoreStoragePost(postID: string): Promise<void> {
  try {
    const postContent = await PostModel.findById(postID);
    const imagePaths = postContent?.photos;
    if (!imagePaths) {
      throw error;
    }
    var totalSize = 0.0;
    for (const path of imagePaths) {
      try {
        totalSize += await getImageSize(path.url);
        await deleteImageFromS3(path.url);
      } catch (error) {
        console.error("Error fetching image size:", error);
      }
    }
    console.log("total size", totalSize);
    const owner = postContent?.author;
    await updateUserStorageOnDelete(owner, totalSize);
  } catch (error) {
    console.error("Error updating user storage on subtract:", error);
  }
}
