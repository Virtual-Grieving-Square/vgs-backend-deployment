import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

export const generateUserAccessToken = (
  id: string,
  fname: string,
  lname: string,
  username: string,
  phoneNumber: string,
) => {
  const data = {
    id: id,
    firstName: fname,
    lastName: lname,
    username: username,
    phoneNumber: phoneNumber,
  };

  return jwt.sign(data, process.env.JWT_SECRET as string);
}