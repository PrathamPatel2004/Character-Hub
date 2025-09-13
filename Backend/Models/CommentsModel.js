import mongoose from "mongoose";

const commentsSchema = new mongoose.Schema({
    commentOnCharacter : { type : mongoose.Schema.Types.ObjectId, ref : 'Character' },
    commentOnSeries : { type : mongoose.Schema.Types.ObjectId, ref : 'Series' },
    commentBy : { type : mongoose.Schema.Types.ObjectId, ref : 'User', required : true },
    repliedTo : { type : mongoose.Schema.Types.ObjectId, ref : 'Comment' },
    content : { type : String, required : true, trim : true },
    likes : [{ type : mongoose.Schema.Types.ObjectId, ref : 'User' }],
    isEdited : { type : Boolean, default : false }
}, { timestamps : true });

const CommentModel = mongoose.model("Comment", commentsSchema);
export default CommentModel;