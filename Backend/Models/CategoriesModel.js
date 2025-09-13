import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    category : { type : String, enum : ['Anime', 'Manga', 'Movies', 'TV Shows', 'Games', 'Comics', 'Original', 'Books', 'Western Animation'], required : true, unique : true },
    icon : { type : String },
    seriesNames: [{ type : mongoose.Schema.Types.ObjectId, ref : 'Series' }],
    slug : { type : String, unique : true }
}, { timestamps : true });

const CategoriesModel = mongoose.model("Category", categorySchema);
export default CategoriesModel