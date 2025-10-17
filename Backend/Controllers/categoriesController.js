import CategoriesModel from '../Models/CategoriesModel.js';

export const getCategories = async (req, res) => {
    try {
        const categoryList = await CategoriesModel.find({}, '_id category icon seriesNames slug').populate('seriesNames', '_id seriesName originalLanguage genre tags coverImage').lean();
        res.status(200).json({ categories : categoryList });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message : 'Failed to fetch series.' });
    }
};