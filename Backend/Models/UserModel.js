import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username : { type : String, required : true, unique : true, minlength : 3 },
    email : { type : String, required : true, unique : true, lowercase : true },
    password : { type : String, required : true, minlength : 6 },
    profilePic : { type : String, default : "" },
    bio : { type : String, default : "" },
    isVerified : { type : Boolean, default : false },
    otp : { type : String },
    otpExpires : { type : Date },
    charactersAdd : [{ type : mongoose.Schema.ObjectId, ref : 'Character' }],
    seriesAdd : [{ type : mongoose.Schema.ObjectId, ref : 'Series' }],
    temporaryBanned : { type : Boolean, default : false },
    reports : { type : Number, default : 0 },
    lastLoggedIn : { type : Date, default : null },
    isFirstLogin : { type : Boolean, default : true },
    followers : [{ type : mongoose.Schema.Types.ObjectId, ref : 'User' }],
    following : [{ type : mongoose.Schema.Types.ObjectId, ref : 'User' }],
    expireAt: {
        type: Date,
        default: null,
        index: { expireAfterSeconds: 0 },
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
}, { timestamps : true });

const UserModel = mongoose.model("User", userSchema);
export default UserModel
