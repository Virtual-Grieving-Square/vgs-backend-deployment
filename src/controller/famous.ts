import { Response, Request } from 'express';
import FamousPeopleModel from '../model/famousPeople';

export const getAll = async (req: Request, res: Response) => {
  try {
    const famous = await FamousPeopleModel.find();

    res.status(200).json(famous);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

export const getByNumber = async (req: Request, res: Response) => {
  try {
    const { number } = req.params;

    const famous = await FamousPeopleModel.find({ number: number });

    // Fetch Image from S3 Bucket

    res.status(200).json(famous);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const { name, profession, dob, dod } = req.body;
    console.log(req.body);
    let number = 1;

    if (!name || !profession || !dob || !dod) {
      return res
        .status(402)
        .json({ message: 'Please fill in all required fields.' });
    }

    // Image Upload Logic

    const famous = await FamousPeopleModel.find().sort({ number: -1 }).limit(1);

    if (famous.length == 0) {
      number = 1;

      await FamousPeopleModel.create({
        name: name,
        profession: profession,
        dob: dob,
        dod: dod,
        number: number,
        // image: image
      });
    } else {
      const previousNumber = famous[0].number;

      number = previousNumber + 1;

      await FamousPeopleModel.create({
        name: name,
        profession: profession,
        dob: dob,
        dod: dod,
        number: number,
        // image: image
      });

    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}