import CharacterModel from '../Models/CharacterModel.js';
import SeriesModel from '../Models/SeriesModel.js';
import sendEmail from '../Config/sendEmail.js';
import UserModel from '../Models/UserModel.js';

export const getCharacter = async (req, res) => {
    try {
        const character = await CharacterModel.findById(req.params.id).populate('category', 'slug category icon').populate('seriesName', 'seriesName coverImage tags').populate('addedBy', 'username profilePic charactersAdd followers').lean();
        res.status(200).json({ character });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message : 'Failed to fetch Character.' });
    } 
};

export const getCharacters = async (req, res) => {
    try {
        const characterList = await CharacterModel.find({}, '_id name category seriesName gender characterImage coverImage imageGallery species role createdBy performedBy addedBy origin tags description facts achievements powers createdAt updatedAt').populate('category', 'slug category icon').populate('seriesName', 'seriesName coverImage').populate('addedBy', 'username profilePic charactersAdd followers').lean();
        res.status(200).json({ characters : characterList });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message : 'Failed to fetch Characters.' });
    }
};

export const addCharacterData = async (req, res) => {
    const {
        name,
        category,
        series,
        gender,
        species,
        role,
        origin,
        description,
        createdBy,
        performedBy,
        tags = [],
        facts = [],
        achievements = [],
        characterImage,
        galleryImages = [],
        powers = [],
    } = req.body;

    const { id } = req.user;
    const user = await UserModel.findById(id);
    const { email, _id } = user;

    try {
        const trimmedName = name?.trim();
        if (!trimmedName) {
            return res.status(400).json({ message : 'Character name is required.' });
        }

        const seriesCheck = await SeriesModel.findById(series);
        if (!seriesCheck) {
            return res.status(400).json({ message : 'Series not found. Please add the series first.' });
        }

        const existingCharacter = await CharacterModel.findOne({
            name : trimmedName,
            seriesName : series,
        });

        if (existingCharacter) {
            return res.status(400).json({ message : 'Character already exists in this series.' });
        } 

        const cleanTags = [...new Set(tags.map(tag => tag.toLowerCase().trim()))];

        const newCharacter = new CharacterModel({
            name : trimmedName,
            category,
            seriesName: series,
            gender,
            species,
            role,
            origin,
            description,
            createdBy,
            performedBy,
            tags : cleanTags,
            facts : facts.filter(f => f?.trim() !== ''),
            achievements: achievements.filter(a => a?.trim() !== ''),
            addedBy : _id,
            coverImage : seriesCheck.coverImage,
            characterImage,
            imageGallery : galleryImages,
            powers : powers.filter(p => p?.trim() !== ''),
        });

        await newCharacter.save();

        await SeriesModel.findByIdAndUpdate(
            series,
            { $push : { characters: newCharacter._id } },
            { new : true }
        );

        await UserModel.findByIdAndUpdate(
            _id,
            { $push : { charactersAdd : newCharacter._id } },
            { new : true }
        );
    
        try {
            await sendEmail({
                to : email,
                subject : 'New Character Added',
                text : `A new character named "${newCharacter.name}" has been added to the series "${seriesCheck.seriesName} at Character Hub".`,
                html : `<p>A new character named <strong>"${newCharacter.name}"</strong> has been added to the series <strong>"${seriesCheck.seriesName}"</strong> at <strong>Character Hub</strong>.</p>
                        <p>Check it out at <a href="https://character-hub-five.vercel.app/character/${newCharacter._id}">Character Hub</a></p>
                        <p>Thank you for your contribution!</p>`
            });
        }catch (e){
            console.warn('Email failed : ', e.message);
        }

        res.status(201).json({
            message : 'Character added successfully.',
            character : newCharacter,
        });
    } catch (err) {
        console.error('Error adding character : ', err);
        res.status(500).json({ message : 'Server error. Please try again.' });
    }
};