import { Response, Request } from "express";
import { ProductModel } from "../model/Product";

export const addProduct = async (req: Request, res: Response) => {
    try {
      const { name, type, price, description } = req.body;
  
      // Check if required fields are provided
      if (!name || !type || !price) {
        return res.status(400).json({ msg: 'Name, type, and price are required fields' });
      }
  
     
      const newProduct = new ProductModel({
        name,
        type,
        price,
        description
      });
  
    
      await newProduct.save();
  
      res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
      console.error('Error adding product:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

