export interface User {
  id: string;
  fname: string;
  lname: string;
  username: string;
  phoneNumber: string;
  email: string;
  subscribed: boolean;
  paid: boolean;
  subType: string;
  firstTimePaid: boolean;
  profileImage: string;
  coverImage: string;
  signInMethod: string;
}