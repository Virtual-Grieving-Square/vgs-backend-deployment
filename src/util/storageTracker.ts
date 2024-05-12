import { UserModel } from "../model/user";
import * as fs from "fs";
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
  try {
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { storage: storageToAddBack },
    });
    console.log("User storage updated successfully on delete.");
  } catch (error) {
    console.error("Error updating user storage on delete:", error);
  }
}

// Function to update user's storage on post
export async function updateUserStorageOnPost(
  userId: string,
  storageToSubtract: number
): Promise<void> {
  try {
    await UserModel.findByIdAndUpdate(userId, { storage: storageToSubtract.toFixed(2) });
    console.log("User storage updated successfully on post.");
  } catch (error) {
    console.error("Error updating user storage on subtract:", error);
  }
}
