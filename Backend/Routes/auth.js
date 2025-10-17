import { Router } from 'express'
import { allUsers, registerUser, OTPVerification, ResendOTP, LoginUser, ForgotPassword, resetPassword, changePassword, validateResetToken, getProfileInfo, addProfileInfo, verifyAccessToken, logoutUser, followUser, unFollowUser, checkFollowStatus } from '../Controllers/userController.js'
import upload from '../MiddleWare/Multer.js'
import auth from '../MiddleWare/auth.js'

const userRouter = Router()

userRouter.get('/allUsers', allUsers)
userRouter.post('/register', registerUser)
userRouter.post('/verify-OTP', OTPVerification)
userRouter.post('/login', LoginUser)
userRouter.post('/resend-otp', ResendOTP)
userRouter.post('/forgot-password', ForgotPassword)
userRouter.post('/reset-password/:token', resetPassword)
userRouter.get('/validate-reset-token/:token', validateResetToken)
userRouter.put('/change-password', auth, changePassword)
userRouter.get('/get-user-info/:id', auth, getProfileInfo)
userRouter.put('/add-profile-info', auth, upload.single('image'), addProfileInfo);
userRouter.get('/verify-access-token', verifyAccessToken);
userRouter.post('/logout', auth, logoutUser);
userRouter.post('/follow/:followingUserId', auth, followUser);
userRouter.delete('/unfollow/:followingUserId', auth, unFollowUser);
userRouter.get('/follow-status/:followingUserId', auth, checkFollowStatus);

export default userRouter
