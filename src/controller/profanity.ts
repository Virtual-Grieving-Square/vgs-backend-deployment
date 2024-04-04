import { Response, Request } from "express";
import { profaneModel } from "../model/profanewords";

export const addWords = async (req: Request, res: Response) => {
    try {
      const { words, level } = req.body;
  
     
      if (!words || !Array.isArray(words) || words.length === 0 || !level) {
        return res
          .status(400)
          .json({ msg: "words (as an array) and level are required fields" });
      }
  
     
      const newWords = [];
  
  
      for (const word of words) {
        const newWord = new profaneModel({
          word,
          level,
        });
  
      
        await newWord.save();
  
    
        newWords.push(newWord);
      }
  
      res
        .status(201)
        .json({ message: "Words added successfully", products: newWords });
    } catch (error) {
      console.error("Error adding words:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
