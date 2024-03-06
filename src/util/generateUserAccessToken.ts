import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

export const generateUserAccessToken = (
  id: string,
  fname: string,
  lname: string,
  username: string,
  phoneNumber: string,
  email: string,
) => {
  const data = {
    id: id,
    fname: fname,
    lname: lname,
    username: username,
    phonenumber: phoneNumber,
    email: email,
  };

  return jwt.sign(data, process.env.JWT_SECRET as string);
}