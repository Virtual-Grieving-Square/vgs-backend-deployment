import { Request, Response } from "express";
import { GroupModel } from "../../model/group";

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, description, userId } = req.body;

    
    if (!name || !description || !userId) {
      return res.status(400).json({ message: "Name, description, and userId are required" });
    }

    
    const group = new GroupModel({
      name,
      description,
      creator: userId, 
      members: [userId] 
    });

    await group.save();

    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    console.error("Error creating group:", error);
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

        return res.status(200).json({ message: "Gallery created successfully", group });
    } catch (error) {
        console.error("Error creating gallery:", error);
        return res.status(500).json({ error: "Internal server error" });
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

      return res.status(200).json({ message: "Group gallery retrieved successfully", gallery });
  } catch (error) {
      console.error("Error retrieving group gallery:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};