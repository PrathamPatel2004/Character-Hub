import CategoriesModel from '../Models/CategoriesModel.js';
import SeriesModel from '../Models/SeriesModel.js';
import sendEmail from '../Config/sendEmail.js';
import UserModel from '../Models/UserModel.js';
import CommentModel from '../Models/CommentsModel.js';

export const getAllSeries = async (req, res) => {
    try {
        const seriesList = await SeriesModel.find({}, '_id seriesName tags category coverImage createdAt updatedAt').populate('category', 'slug category icon').lean();
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

export const updateSeriesData = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;
    const { availableIn, status, productionStudio, createdBy, publication, Author, tags = [], description } = req.body;

    try {
        const series = await SeriesModel.findById(id);
        if (!series) {
            return res.status(404).json({ message: 'Series not found.' });
        }

        if (series.addedBy?.toString() !== userId) {
            return res.status(403).json({ message: 'You do not have permission to edit this series.' });
        }

        if (availableIn !== undefined) series.availableIn = availableIn;
        if (status !== undefined) series.status = status;
        if (productionStudio !== undefined) series.productionStudio = productionStudio;
        if (createdBy !== undefined) series.createdBy = createdBy;
        if (publication !== undefined) series.publication = publication;
        if (Author !== undefined) series.Author = Author;
        if (description !== undefined) series.description = description;
        series.tags = [...new Set(tags.map(tag => tag.toLowerCase().trim()))];

        await series.save();

        res.status(200).json({ message: 'Series updated successfully.', series });
    } catch (err) {
        console.error('Error updating series : ', err);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
};

export const deleteSeriesData = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        const series = await SeriesModel.findById(id);
        if (!series) {
            return res.status(404).json({ message: 'Series not found.' });
        }

        if (series.addedBy?.toString() !== userId) {
            return res.status(403).json({ message: 'You do not have permission to delete this series.' });
        }

        if (series.characters?.length > 0) {
            return res.status(400).json({ message: 'This series still has characters attached. Remove or reassign them before deleting the series.' });
        }
        await CommentModel.deleteMany({ commentOnSeries : series._id });
        await CategoriesModel.findByIdAndUpdate(series.category, { $pull : { seriesNames : series._id } });
        await UserModel.findByIdAndUpdate(series.addedBy, { $pull : { seriesAdd : series._id } });
        await series.deleteOne();

        res.status(200).json({ message: 'Series deleted successfully.' });
    } catch (err) {
        console.error('Error deleting series : ', err);
        res.status(500).json({ message: 'Server error. Please try again.' });
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
                subject : 'New Series Added to Character Hub',
                text : `A new Series named "${newSeries.seriesName}" has been added.`,
                html : `<p>A new Series named <strong>"${newSeries.seriesName}"</strong> has been added.</p>
                        <p>Check it out <a href="https://character-hub-five.vercel.app/series/${newSeries._id}">here</a></p>`

            });
        }catch (e){
            console.warn('Email failed : ', e.message);
        }

        res.status(201).json({ message : 'Series added successfully.', series : newSeries });
    } catch (err) {
        console.error('Error adding character:', err);
        res.status(500).json({ message : 'Server error. Please try again.' });
    }
};