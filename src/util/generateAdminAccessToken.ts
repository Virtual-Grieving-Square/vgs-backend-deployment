import jwt from 'jsonwebtoken';

export const generateAdminAccessToken = (
  id: string,
  fname: string,
  lname: string,
  email: string,
  role: string,
) => {
  const data = {
    id: id,
    fname: fname,
    lname: lname,
    email: email,
    role: role
  };

  return jwt.sign(data, process.env.JWT_SECRET as string);
}