import { RequestHandler } from "express";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import ejs from "ejs";

// Models
import { UserModel } from "../model/user";
import { RecoverPasswordModel } from "../model/recoverPassword";
import { SubscriptionPlanModel } from "../model/subscriptionPlan";
import { TempUserModel } from "../model/tempUser";


// Functions
import { verificationCodeGenerator } from "../util/verificationCodeGenerator";
import { generateUserAccessToken } from "../util/generateUserAccessToken";
import { sendEmail } from "../util/email";
import { sendOtp, verifyOtp } from "../util/smsMethods";
import { generateRandomNumber } from "../util/generateRandomNumber";

// Sign up
export const signup: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, username, email, password } =
      req.body.data;
    const phoneNumber = req.body.phoneNumber;
    const verification = req.body.verification;
    const subscriptionType = req.body.subscriptionType;
    const existingUserByEmail = await UserModel.findOne({ email: email });
    const existingUserByPhone = await UserModel.findOne({
      phoneNumber: phoneNumber,
    });
    const verificationCode = verificationCodeGenerator(6);

    if (existingUserByEmail) {
      console.error("User with this Email already exists");
      return res
        .status(401)
        .json({ message: "User with this email already exists" });
    }

    if (existingUserByPhone) {
      console.error("User with this Phone Number already exists");
      return res
        .status(402)
        .json({ message: "User with this PhoneNumber already exists" });
    }

    if (subscriptionType != "free") {
      const newSubscriptionPlan = await SubscriptionPlanModel.find({
        id: subscriptionType,
      });
      console.log("Subscription Plan", newSubscriptionPlan);
    }

    if (verification == "phone") {
      // here is where i need to send the sms
      const verificationSMS = await sendOtp(phoneNumber);
      const checkTempUser = await TempUserModel.findOne({
        phoneNumber: phoneNumber,
      });

      if (checkTempUser) {
        await TempUserModel.updateOne(
          { phoneNumber: phoneNumber },
          {
            $set: {
              firstName: firstName,
              lastName: lastName,
              username: username,
              email: email,
              phoneNumber: phoneNumber,
              otp: verificationCode,
              subscriptionType: subscriptionType,
              password: password,
            },
          }
        );
      } else {
        const tempUser = new TempUserModel({
          firstName: firstName,
          lastName: lastName,
          username: username,
          email: email,
          phoneNumber: phoneNumber,
          otp: verificationCode,
          subscriptionType: subscriptionType,
          password: password,
        });

        await tempUser.save();
      }
      res.status(200).json({
        type: "phone",
        phoneNumber: phoneNumber,
        message: "Verification code sent successfully",
      });
    } else if (verification == "email") {
      console.log("Verification Email");

      const checkTempUser = await TempUserModel.findOne({
        email: email,
      });

      if (checkTempUser) {
        await TempUserModel.updateOne(
          { email: email },
          {
            $set: {
              firstName: firstName,
              lastName: lastName,
              username: username,
              email: email,
              phoneNumber: phoneNumber,
              otp: verificationCode,
              subscriptionType: subscriptionType,
              password: password,
            },
          }
        );
      } else {
        const tempUser = new TempUserModel({
          firstName: firstName,
          lastName: lastName,
          username: username,
          email: email,
          phoneNumber: phoneNumber,
          otp: verificationCode,
          subscriptionType: subscriptionType,
          password: password,
        });

        await tempUser.save();
      }

      sendEmail("signup", {
        firstName: firstName,
        lastName: lastName,
        email: email,
        verificationCode: verificationCode,
      }).then((response) => {
        if (response == true) {
          res.status(200).json({
            type: "email",
            email: email,
            message: "Verification code sent successfully",
          });
        } else {
          res
            .status(408)
            .json({ message: "Unable to send Email at the Moment" });
        }
      });
    }
  } catch (error) {
    console.error("Error signing up user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verify: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, phoneNumber, otp, type } = req.body;
    console.log(req.body);

    if (type == "email") {
      const tempUser = await TempUserModel.findOne({ email: email, otp: otp });

      if (tempUser) {
        const storagePicked = await SubscriptionPlanModel.findOne({
          name: tempUser.subscriptionType,
        });
        const hashedPassword = await bcrypt.hash(tempUser.password, 10);
        const storageSubscribed = storagePicked?.storagePerk || 0;

        const user = new UserModel({
          firstName: tempUser.firstName,
          lastName: tempUser.lastName,
          username: tempUser.username,
          email: tempUser.email,
          phoneNumber: tempUser.phoneNumber,
          password: hashedPassword,
          subscriptionType: tempUser.subscriptionType,
          signInMethod: "Email",
          storage: storageSubscribed,
        });

        await user.save();

        const accessToken = generateUserAccessToken(
          user._id,
          user.firstName,
          user.lastName,
          user.username,
          user.phoneNumber,
          user.email,
          user.subscriptionType,
          user.firstTimePaid,
          "email",
          user.profileImage || ""
        );

        await TempUserModel.deleteOne({
          email: email,
        });

        res.status(200).json({
          accessToken: accessToken,
          message: "User created successfully",
        });
      } else {
        res.status(401).json({ msg: "Invalid OTP" });
      }
    } else if (type == "phone") {
      const verification = await verifyOtp(otp, phoneNumber);
      if (verification !== "approved") {
        res.status(401).json({ msg: "Invalid OTP" });
      }
      const tempUser = await TempUserModel.findOne({
        phoneNumber: phoneNumber,
      });

      if (tempUser) {
        const hashedPassword = await bcrypt.hash(tempUser.password, 10);

        const user = new UserModel({
          firstName: tempUser.firstName,
          lastName: tempUser.lastName,
          username: tempUser.username,
          email: tempUser.email,
          phoneNumber: tempUser.phoneNumber,
          password: hashedPassword,
          signInMethod: "Phone",
        });
        await user.save();

        const accessToken = generateUserAccessToken(
          user._id,
          user.firstName,
          user.lastName,
          user.username,
          user.phoneNumber,
          user.email,
          user.subscriptionType,
          user.firstTimePaid,
          "phone",
          user.profileImage || ""
        );

        res.status(200).json({
          accessToken: accessToken,
          message: "User created successfully",
        });
      } else {
        res.status(401).json({ msg: "Invalid OTP" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body.data;
    // console.log(req.body)
    if (!email || !password) {
      return res
        .status(401)
        .json({ message: "Authentication failed. not full information." });
    }
    // Find user by email
    const user = await UserModel.findOne({
      email: email,
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Authentication failed. User not found." });
    }

    // Check if password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(402)
        .json({ message: "Authentication failed. Invalid password." });
    }

    const accessToken = generateUserAccessToken(
      user._id,
      user.firstName,
      user.lastName,
      user.username,
      user.phoneNumber,
      user.email,
      user.subscriptionType,
      user.firstTimePaid,
      "email",
      user.profileImage || ""
    );

    await UserModel.updateOne(
      { email: email },
      {
        $set: {
          accessToken: accessToken,
        },
      }
    );

    return res.status(200).json({
      accessToken: accessToken,
      message: "Authentication successful",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkGoogleSignin: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.params;
    const existingUser = await UserModel.findOne({ email: email });

    if (!existingUser) {
      return res.status(200).json({ user: false });
    } else {
      return res.status(200).json({ user: true });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const signInWithGoogle: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      username,
      profileImage,
      accessToken,
      refreshToken,
      subscriptionType
    } = req.body;


    console.log(req.body);

    const existingUser = await UserModel.findOne({ email: email });

    if (!existingUser) {
      const user = new UserModel({
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber || `${generateRandomNumber(20)}`,
        username: username,
        profileImage: profileImage,
        accessToken: accessToken,
        refreshToken: refreshToken,
        subscriptionType: subscriptionType,
        signInMethod: "Google",
      });

      await user.save();

      const accessTokenToken = generateUserAccessToken(
        user._id,
        user.firstName,
        user.lastName,
        user.username,
        user.phoneNumber,
        user.email,
        user.subscriptionType,
        user.firstTimePaid,
        "google",
        user.profileImage || ""
      );

      return res.status(200).json({
        accessToken: accessTokenToken,
        account: "new",
        message: "User created successfully",
      });
    } else {
      const user = await UserModel.findOne({ email: email });

      const accessToken1 = generateUserAccessToken(
        user!._id,
        user!.firstName,
        user!.lastName,
        user!.username,
        user!.phoneNumber,
        user!.email,
        user!.subscriptionType,
        user!.firstTimePaid,
        "email",
        user!.profileImage || ""
      );

      return res.status(200).json({
        accessToken: accessToken1,
        account: "existing",
        message: "User created successfully",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendOTP: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const env = process.env;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const verificationCode = verificationCodeGenerator(6);

    const checkTry = await RecoverPasswordModel.findOne({ email: email });

    if (checkTry) {
      await RecoverPasswordModel.updateOne(
        { email: email },
        {
          $set: {
            email: email,
            code: verificationCode,
          },
        }
      );
    } else {
      const recoverPassword = new RecoverPasswordModel({
        email: email,
        code: verificationCode,
      });

      await recoverPassword.save();
    }

    const ejsTemplatePath = path.join(
      __dirname!,
      "../../src/pages/auth/recoverPassword.ejs"
    );
    const ejsTemplate = fs.readFileSync(ejsTemplatePath, "utf-8");
    const renderHtml = ejs.render(ejsTemplate, {
      name: `${user.firstName} ${user.lastName}`,
      code: verificationCode,
    });

    const transporter = await nodemailer.createTransport({
      host: "smtp.titan.email",
      port: 465,
      secure: true,
      auth: {
        user: "verification@virtualgrievingsquare.com",
        pass: "8-yKf~NGAwn?*dF",
      },
    });

    const info = await transporter.sendMail({
      from: '"Virtual Grieving Square" <verification@virtualgrievingsquare.com>',
      to: email,
      subject: "Virtual Grieving Square Verification",
      html: renderHtml,
    });

    console.log("Message sent: %s", info.messageId);

    return res
      .status(200)
      .json({ message: "Verification code sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOTP: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, code } = req.body;

    const checkTry = await RecoverPasswordModel.findOne({
      email: email,
      code: code,
    });

    if (checkTry) {
      return res.status(200).json({ message: "Verification successful" });
    } else {
      return res.status(401).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.updateOne(
      {
        email: email,
      },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const requestPasswordReset: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_RESET_SECRET || "default_reset_secret", // You should use a secure secret in production
      { expiresIn: "1h" } // Token expiration time
    );

    // TODO: Send reset password email to user's email address containing the reset link with token

    return res.status(200).json({ message: "Password reset email sent." });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, newPassword } = req.body;

    // Verify and decode the token
    const decodedToken: any = jwt.verify(
      token,
      process.env.JWT_RESET_SECRET || "default_reset_secret"
    );

    // Find user by ID
    const user = await UserModel.findById(decodedToken.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    if ((error as any).name === "TokenExpiredError") {
      return res.status(400).json({
        message: "Token expired. Please request a new password reset.",
      });
    }
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(201).json({ message: "User not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
