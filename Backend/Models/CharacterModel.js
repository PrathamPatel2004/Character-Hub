import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema({
    name : { type : String, required : true, unique : true, trim: true },
    category : { type : mongoose.Schema.ObjectId, ref : 'Category', required : true },
    seriesName : { type : mongoose.Schema.Types.ObjectId, ref : 'Series', required : true },
    gender : { type : String },
    characterImage : { type : String, required : true },
    coverImage : { type : String, required : true },
    imageGallery : [{ type : String }],
    species : { type : String, required : true, trim : true },
    role : { type : String, required : true },
    createdBy : { type : String, required : true },
    performedBy : { type : String },
    addedBy : { type : mongoose.Schema.ObjectId, ref : 'User' },
    origin : { type : String, required : true },
    tags: [{ type: String, trim: true }],
    description : { type : String, required : true },
    facts : [{ type : String, trim : true }],
    achievements : [{ type : String, trim : true }],
    comments : [{ type : mongoose.Schema.Types.ObjectId, ref : 'Comments' }],
    powers : [{ type : String, trim : true }],
}, { timestamps: true });

const CharacterModel = mongoose.model("Character", characterSchema);
export default CharacterModel