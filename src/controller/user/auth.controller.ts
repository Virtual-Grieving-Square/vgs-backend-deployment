import { RequestHandler } from "express";
import { UserModel } from "../../model/user";
import { Request, Response, NextFunction } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signup: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { firstName, lastName, username, email, phoneNumber, password } = req.body.data;
        const verification = req.body.verification;

        const existingUserByEmail = await UserModel.findOne({ email: email });
        const existingUserByPhone = await UserModel.findOne({ phoneNumber: phoneNumber });

        if (existingUserByEmail) {
            console.error("User with this Email already exists");
            return res.status(401).json({ message: "User with this email already exists" });
        }

        if (existingUserByPhone) {
            console.error("User with this Phone Number already exists");
            return res.status(402).json({ message: "User with this PhoneNumber already exists" });
        }

        // const hashedPassword = await bcrypt.hash(password, 10);


        // const newUser = new UserModel({ name, lastName, email, password: hashedPassword });

        // await newUser.save();

        // return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Error signing up user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const login: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Authentication failed. User not found." });
        }

        // Check if password is correct
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Authentication failed. Invalid password." });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'default_secret', // You should use a secure secret in production
            { expiresIn: '24h' } // Token expiration time
        );

        return res.status(200).json({ message: "Authentication successful", token });
    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

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