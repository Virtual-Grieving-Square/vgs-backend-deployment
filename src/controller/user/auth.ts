import { RequestHandler } from "express";
import { UserModel } from "../../model/user";
import { Request, Response, NextFunction } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import ejs from 'ejs';

import { verificationCodeGenerator } from "../../util/verificationCodeGenerator";
import { TempUserModel } from "../../model/tempUser";
import { generateUserAccessToken } from "../../util/generateUserAccessToken";


export const signup: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const env = process.env;

        const { firstName, lastName, username, email, phoneNumber, password } = req.body.data;
        const verification = req.body.verification;
        const existingUserByEmail = await UserModel.findOne({ email: email });
        const existingUserByPhone = await UserModel.findOne({ phoneNumber: phoneNumber });
        const verificationCode = verificationCodeGenerator(6);

        if (existingUserByEmail) {
            console.error("User with this Email already exists");
            return res.status(401).json({ message: "User with this email already exists" });
        }

        if (existingUserByPhone) {
            console.error("User with this Phone Number already exists");
            return res.status(402).json({ message: "User with this PhoneNumber already exists" });
        }

        if (verification == 'phone') {
            const accountSid = 'ACf82578cfbc9c0f0c997db5bf896f4d22';
            const authToken = '97da9c183b6e14dd69c237abe194c489';
            const client = require('twilio')(accountSid, authToken);
            const verificationMessage = `Your verification code is ${verificationCode}`;

            console.log(verificationMessage);

            // client.messages
            //     .create({
            //         body: verificationMessage,
            //         from: '+18664601237',
            //         to: '+18777804236'
            //     })
            //     .then((message: any) => {
            //         console.log(message.sid);
            //     })
            //     .done();

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
                            password: password
                        }
                    });

            } else {
                const tempUser = new TempUserModel({
                    firstName: firstName,
                    lastName: lastName,
                    username: username,
                    email: email,
                    phoneNumber: phoneNumber,
                    otp: verificationCode,
                    password: password
                });

                await tempUser.save();
            }
            res.status(200).json({
                type: "phone",
                phoneNumber: phoneNumber,
                message: "Verification code sent successfully"
            });
        } else if (verification == 'email') {
            console.log("Verification Email");

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
                            password: password
                        }
                    });
            } else {
                const tempUser = new TempUserModel({
                    firstName: firstName,
                    lastName: lastName,
                    username: username,
                    email: email,
                    phoneNumber: phoneNumber,
                    otp: verificationCode,
                    password: password
                });

                await tempUser.save();
            }

            const ejsTemplatePath = path.join(env.FILE_PATH!, '/src/pages/auth/signup.ejs');
            const ejsTemplate = fs.readFileSync(ejsTemplatePath, "utf-8");
            const renderHtml = ejs.render(ejsTemplate, { name: `${firstName} ${lastName}`, code: verificationCode });


            const transporter = nodemailer.createTransport({
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

            res.status(200).json({
                type: "email",
                email: email,
                message: "Verification code sent successfully"
            });
        }

    } catch (error) {
        console.error("Error signing up user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const verify: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, phoneNumber, otp, type } = req.body;
        console.log(req.body);

        if (type == 'email') {
            const tempUser = await TempUserModel.findOne({ email: email, otp: otp });

            if (tempUser) {
                const hashedPassword = await bcrypt.hash(tempUser.password, 10);

                const user = new UserModel({
                    firstName: tempUser.firstName,
                    lastName: tempUser.lastName,
                    username: tempUser.username,
                    email: tempUser.email,
                    phoneNumber: tempUser.phoneNumber,
                    password: hashedPassword
                });

                await user.save();

                const accessToken = generateUserAccessToken(
                    user._id,
                    user.firstName,
                    user.lastName,
                    user.username,
                    user.phoneNumber,
                    user.email
                );

                res.status(200).json({
                    accessToken: accessToken,
                    message: "User created successfully"
                });
            } else {
                res.status(401).json({ msg: "Invalid OTP" });
            }

        } else if (type == 'phone') {
            const tempUser = await TempUserModel.findOne({ phoneNumber: phoneNumber, otp: otp });

            if (tempUser) {
                const hashedPassword = await bcrypt.hash(tempUser.password, 10);

                const user = new UserModel({
                    firstName: tempUser.firstName,
                    lastName: tempUser.lastName,
                    username: tempUser.username,
                    email: tempUser.email,
                    phoneNumber: tempUser.phoneNumber,
                    password: hashedPassword
                });
                await user.save();

                const accessToken = generateUserAccessToken(
                    user._id,
                    user.firstName,
                    user.lastName,
                    user.username,
                    user.phoneNumber,
                    user.email);

                res.status(200).json({
                    accessToken: accessToken,
                    message: "User created successfully"
                });

            } else {
                res.status(401).json({ msg: "Invalid OTP" });
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const login: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body.data;
        console.log(req.body)
        // Find user by email
        const user = await UserModel.findOne({
            email: email
        });

        if (!user) {
            return res.status(401).json({ message: "Authentication failed. User not found." });
        }

        // Check if password is correct
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(402).json({ message: "Authentication failed. Invalid password." });
        }

        const accessToken = generateUserAccessToken(
            user._id,
            user.firstName,
            user.lastName,
            user.username,
            user.phoneNumber,
            user.email);

        await UserModel.updateOne(
            { email: email },
            {
                $set: {
                    accessToken: accessToken
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

export const signInWithGoogle: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            username,
            profileImage,
            accessToken,
            refreshToken
        } = req.body;

        const existingUser = await UserModel.findOne({ email: email });

        if (!existingUser) {
            const user = new UserModel({
                firstName: firstName,
                lastName: lastName,
                email: email,
                phoneNumber: phoneNumber || "",
                username: username,
                profileImage: profileImage,
                accessToken: accessToken,
                refreshToken: refreshToken,
                signInMethod: "Google"
            });

            await user.save();

            return res.status(200).json({ message: "User created successfully" });
        }

        const user = await UserModel.findOne({ email: email });

        const accessToken1 = generateUserAccessToken(
            user!._id,
            user!.firstName,
            user!.lastName,
            user!.username,
            user!.phoneNumber,
            user!.email);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const requestPasswordReset: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;


        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }


        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_RESET_SECRET || 'default_reset_secret', // You should use a secure secret in production
            { expiresIn: '1h' } // Token expiration time
        );

        // TODO: Send reset password email to user's email address containing the reset link with token

        return res.status(200).json({ message: "Password reset email sent." });
    } catch (error) {
        console.error("Error requesting password reset:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const resetPassword: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token, newPassword } = req.body;

        // Verify and decode the token
        const decodedToken: any = jwt.verify(token, process.env.JWT_RESET_SECRET || 'default_reset_secret');

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
        if ((error as any).name === 'TokenExpiredError') {
            return res.status(400).json({ message: "Token expired. Please request a new password reset." });
        }
        console.error("Error resetting password:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};