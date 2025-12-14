import CategoriesModel from '../Models/CategoriesModel.js';
import SeriesModel from '../Models/SeriesModel.js';
import sendEmail from '../Config/sendEmail.js';
import UserModel from '../Models/UserModel.js';

export const getAllSeries = async (req, res) => {
    try {
        const seriesList = await SeriesModel.find({}, '_id seriesName originalLanguage availableIn genre tags characters category coverImage productionStudio publication createdBy Author imageGallery addedBy description createdAt updatedAt').populate('category', 'slug category icon').populate('characters', 'name gender characterImage role').populate('addedBy', 'username profilePic charactersAdd followers').lean();
        res.status(200).json({ series : seriesList });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message : 'Failed to fetch series.' });
    }
};

export const getSeries = async (req, res) => {
    const { id } = req.params;
    try {
        const series = await SeriesModel.findById(req.params.id).populate('category', 'slug category icon').populate('characters', 'name gender characterImage role seriesName').populate('addedBy', 'username profilePic charactersAdd followers').lean();
        res.status(200).json({ series });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message : 'Failed to fetch Series.' });
    }
};

export const addSeriesData = async (req, res) => {
    const {
        seriesName,
        originalLanguage,
        availableIn,
        genre,
        category,
        status,
        characters = [],
        coverImage,
        productionStudio,
        publication,
        createdBy,
        Author,
        tags = [],
        imageGallery = [],
        description,
    } = req.body;

    const { id } = req.user;
    const user = await UserModel.findById(id);
    const { email, _id } = user;

    try {
        const trimmedName = seriesName?.trim();
        if (!trimmedName) {
            return res.status(400).json({ message : 'Series name is required.' });
        }

        const existingSeries = await SeriesModel.findOne({
            seriesName : trimmedName,
        });

        if (existingSeries) {
            return res.status(400).json({ message : 'Series already exists in this database.' });
        }

        const cleanTags = [...new Set(tags.map(tag => tag.toLowerCase().trim()))];

        const newSeries = new SeriesModel({
            seriesName : trimmedName,
            originalLanguage,
            availableIn,
            genre,
            category,
            status,
            characters,
            coverImage,
            productionStudio,
            publication,
            createdBy,
            Author,
            tags: cleanTags,
            addedBy : _id,
            description,
            imageGallery,
        });

        await newSeries.save();

        await UserModel.findByIdAndUpdate(
            _id,
            { $push : { seriesAdd : newSeries._id } },
            { new : true }
        );

        await CategoriesModel.findByIdAndUpdate(
            category,
            { $push : { seriesNames : newSeries._id } },
            { new : true }
        );
    
        try {
            await sendEmail({
                to : email,
                subject : 'New Series Added',
                text : `A new Series named "${newSeries.seriesName}" has been added.`,
            });
        }catch (e){
            console.warn('Email failed : ', e.message);
        }

        res.status(201).json({
            messagev : 'Series added successfully.',
            series : newSeries,
        });
    } catch (err) {
        console.error('Error adding character:', err);
        res.status(500).json({ message : 'Server error. Please try again.' });
    }
};