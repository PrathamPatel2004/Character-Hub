import sendEmail from '../Config/sendEmail.js';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../Models/UserModel.js';
import mongoose from 'mongoose';
import generateAccessToken from '../Utils/generateAccessToken.js';
import uploadImageClodinary from '../Utils/uploadImageClodinary.js';
import crypto from 'crypto';
import { populate } from 'dotenv';

export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) return res.status(400).json({ message : 'Email already in use' });

        const existingUsername = await UserModel.findOne({ username });
        if (existingUsername) return res.status(400).json({ message : 'Username already taken' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresTime = Date.now() + 10 * 60 * 1000;
        const expireAt = new Date(Date.now() + 15 * 60 * 1000);

        const newUser = new UserModel({
            username,
            email,
            password : hashedPassword,
            isVerified : false,
            otp,
            otpExpires : otpExpiresTime,
            expireAt,
        });

        await newUser.save();

        await sendEmail({
            to : email,
            subject : 'Verify your Mail - Character Hub',
            text : `Please verify your email using the following OTP, if you did not request this, please Contact us`,
            html : `<h2>Verify your email</h2>
                    <p>Your OTP is:</p>
                    <h1>${otp}</h1>
                    <p>This OTP expires in 10 minutes.</p>`,
        });

        res.status(201).json({ message : 'User registered successfully. Please verify your email', email : newUser.email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message : 'Server error' });
    }
};

export const OTPVerification = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json({ message : 'User not found' });
        if (user.isVerified) return res.status(400).json({ message : 'User already verified' });

        if (user.otp !== otp) {
            return res.status(400).json({ message : 'Invalid OTP code' });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message : 'OTP has expired, Request New OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        user.expireAt = undefined;
        await user.save();

        res.status(200).json({ message : 'User verified successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message : 'Server error' });
    }
};

export const ResendOTP = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json({ message : 'User not found' });
        if (user.isVerified) return res.status(400).json({ message : 'User already verified' });

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = newOtp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        user.expireAt = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        await sendEmail({
            to: email,
            subject: 'Your new OTP code',
            text: `You received a new OTP code, if you did not request this, please Contact us`,
            html: `<h2>Your new OTP code</h2>
                    <p>Your New OTP is:</p>
                    <h1>${otp}</h1>
                    <p>This OTP expires in 10 minutes.</p>`,
        });

        res.status(200).json({ message : 'New OTP sent' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message : 'Server error' });
    }
};

export const LoginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await UserModel.findOne({ email });
        if (!user || !user.isVerified) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.temporaryBanned) {
            return res.status(401).json({
                message: 'Your account is temporarily banned. Contact support.',
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const accesstoken = generateAccessToken(user._id);

        const wasFirstLogin = user.isFirstLogin;
        user.lastLoggedIn = new Date();
        if (wasFirstLogin) user.isFirstLogin = false;
        await user.save();

        res.cookie('accesstoken', accesstoken, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 1000 * 60 * 60 * 24 * 30,
        });

        res.status(200).json({
            message: 'Login successful',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePic: user.profilePic,
                isFirstLogin: wasFirstLogin,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const ForgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

        await sendEmail({
            to : email,
            subject : 'Reset your password',
            html: `<p>Click the link below to reset your password. The link expires in 15 minutes, if you did not request this, please Contact us</p>
                   <button style="background-color: #4CAF50; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;"><a href="${resetLink}">Reset Password</a></button>`,
        });

        res.status(200).json({ message : 'Reset link sent to your email' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message : 'Server error' });
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await UserModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }, // Token not expired
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};

export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Both current and new passwords are required' });
    }

    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Error in changePassword:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const validateResetToken = async (req, res) => {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    try {
        const user = await UserModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        res.status(200).json({ message: 'Token is valid' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addProfileInfo = async (req, res) => {
    const { id } = req.user;
    const { bio } = req.body;

    if (!bio && !req.file) {
        return res.status(400).json({ message: 'No data provided to update.' });
    }

    try {
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (req.file) {
            const uploadedImage = await uploadImageClodinary(req.file);
            user.profilePic = uploadedImage.url;
        }
        if (bio) {
            user.bio = bio;
        }

        await user.save();

        return res.status(200).json({
            message: 'Profile info updated successfully',
            data: {
                avatar: user.profilePic,
                bio: user.bio
            }
        });

    } catch (err) {
        console.error('Error in addProfileInfo:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProfileInfo = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
    const user = await UserModel.findById(id)
        .populate({
            path: 'charactersAdd',
            select: 'name gender characterImage role tags seriesName',
            populate: {
                path: 'seriesName',
                select: 'seriesName coverImage category'
            }
        })
        .populate({
            path: 'following',
            select: 'username profilePic charactersAdd followers'
        })
        .populate({
            path: 'followers',
            select: 'username profilePic charactersAdd followers'
        })
        .populate({
            path: 'seriesAdd',
            select: 'seriesName coverImage category',
            populate: {
                path: 'category',
                select: 'slug category icon'
            }
        })
        .lean();

    if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile info fetched successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const verifyAccessToken = (req, res) => {
  const token = req.cookies?.accesstoken;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
    return res.status(200).json({ valid: true, userId: decoded.id });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const logoutUser = (req, res) => {
    res.clearCookie('accesstoken', accesstoken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
  res.status(200).json({ message: 'Logged out' });
};

export const followUser = async (req, res) => {
    const { id } = req.user;
    const { followingUserId } = req.params;

    if (id === followingUserId) {
        return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    try {
        const user = await UserModel.findById(id);
        const followingUser = await UserModel.findById(followingUserId);

        if (!user || !followingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Ensure arrays are initialized
        if (!user.following) user.following = [];
        if (!followingUser.followers) followingUser.followers = [];

        if (user.following.includes(followingUserId)) {
            return res.status(400).json({ message: 'You are already following this user' });
        }

        user.following.push(followingUserId);
        followingUser.followers.push(id);

        await user.save();
        await followingUser.save();

        res.status(200).json({ message: 'User followed successfully' });
    } catch (err) {
        console.error('Error in followUser:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const unFollowUser = async (req, res) => {
    const { id } = req.user;
    const { followingUserId } = req.params;

    if (id === followingUserId) {
        return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    try {
        const user = await UserModel.findById(id);
        const followingUser = await UserModel.findById(followingUserId);

        if (!user || !followingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.following) user.following = [];
        if (!followingUser.followers) followingUser.followers = [];

        if (!user.following.includes(followingUserId)) {
            return res.status(400).json({ message: 'You are not following this user' });
        }

        user.following = user.following.filter(uid => uid.toString() !== followingUserId);
        followingUser.followers = followingUser.followers.filter(uid => uid.toString() !== id);

        await user.save();
        await followingUser.save();

        res.status(200).json({ message: 'User unfollowed successfully' });
    } catch (err) {
        console.error('Error in unFollowUser:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const checkFollowStatus = async (req, res) => {
    const { id } = req.user;
    const { followingUserId } = req.params;

    try {
        const user = await UserModel.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isFollowing = user.following.includes(followingUserId);
        res.status(200).json({ isFollowing });
    } catch (err) {
        console.error('Error in checkFollowStatus:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const allUsers = async (req, res) => {
    try {
        const userList = await UserModel.find({});
        res.status(200).json({ users : userList });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
}
