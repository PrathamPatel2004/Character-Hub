import mongoose from "mongoose";

const seriesSchema = new mongoose.Schema({
    seriesName : { type : String, required : true, unique : true, trim : true },
    originalLanguage : { type : String, required : true },
    availableIn : { type : String },
    genre : { type : String, required : true, trim : true },
    status : { type : String, required : true },
    category : { type : mongoose.Schema.Types.ObjectId, ref : 'Category', required : true },
    tags : [{ type : String, trim : true }],
    characters : [{ type : mongoose.Schema.Types.ObjectId, ref : 'Character' }],
    coverImage : { type : String, required : true },
    productionStudio : { type : String, trim : true },
    publication : { type : String, trim : true },
    createdBy : { type : String, trim : true },
    Author : { type : String, trim : true },
    imageGallery : [{ type : String }],
    addedBy : { type : mongoose.Schema.Types.ObjectId, ref : 'User', required : true },
    comments : [{ type : mongoose.Schema.Types.ObjectId, ref : 'Comments' }],
    description : { type : String, required : true, maxlength : 2000 }
}, { timestamps : true });

const SeriesModel = mongoose.model("Series", seriesSchema);
export default SeriesModel