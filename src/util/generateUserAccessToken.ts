import jwt from 'jsonwebtoken';

export const generateUserAccessToken = (
  id: string,
  fname: string,
  lname: string,
  username: string,
  phoneNumber: string,
  email: string,
  subType: string,
  firstTimePaid: boolean,
  signInMethod: string,
) => {
  const data = {
    id: id,
    fname: fname,
    lname: lname,
    username: username,
    phonenumber: phoneNumber,
    email: email,
    subType: subType,
    firstTimePaid: firstTimePaid,
    signInMethod: signInMethod,
  };

  return jwt.sign(data, process.env.JWT_SECRET as string);
}
