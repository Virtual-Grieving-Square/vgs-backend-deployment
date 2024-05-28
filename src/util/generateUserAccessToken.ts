import jwt from 'jsonwebtoken';
import { User } from '../types/user';

export const generateUserAccessToken = (user: User) => {

  const {
    id,
    fname,
    lname,
    username,
    phoneNumber,
    email,
    subType,
    paid,
    subscribed,
    firstTimePaid,
    profileImage,
    coverImage,
    signInMethod,
  } = user;

  const data = {
    id: id,
    fname: fname,
    lname: lname,
    username: username,
    phonenumber: phoneNumber,
    email: email,
    subscribed: subscribed,
    paid: paid,
    subType: subType || "",
    firstTimePaid: firstTimePaid,
    signInMethod: signInMethod || "",
    profileImage: profileImage || "",
    coverImage: coverImage || "",
  };

  return jwt.sign(data, process.env.JWT_SECRET as string);
}
