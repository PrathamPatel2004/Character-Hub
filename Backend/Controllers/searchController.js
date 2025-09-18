import CharacterModel from '../Models/CharacterModel.js';
import SeriesModel from '../Models/SeriesModel.js';
import CategoryModel from '../Models/CategoriesModel.js';
import UserModel from '../Models/UserModel.js';

export const searchQuery = async (req, res) => {
    const query = req.query.q;

    if (!query || !query.trim()) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }

    try {
        const words = query.trim().split(/\s+/);
        const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regexes = words.map(word => new RegExp(escapeRegex(word), 'i'));

        const uniqueById = (arr) => {
            const map = new Map();
            arr.forEach(item => map.set(item._id.toString(), item));
            return Array.from(map.values());
        };

        const directSeriesMatches = await SeriesModel.find({
            $or: [
                ...regexes.map(r => ({ seriesName: r })),
                ...regexes.map(r => ({ tags: r }))
            ]
        })
        .select('_id seriesName originalLanguage genre tags coverImage characters')
        .lean();

        const directCharacterMatches = await CharacterModel.find({
            $or: [
                ...regexes.map(r => ({ name: r })),
                ...regexes.map(r => ({ tags: r }))
            ]
        })
        .select('_id name gender characterImage species role seriesName tags')
        .lean();

        const characterIdsFromSeries = directSeriesMatches.flatMap(series =>
            Array.isArray(series.characters) ? series.characters.map(id => id.toString()) : []
        );

        const existingCharacterIds = new Set(directCharacterMatches.map(c => c._id.toString()));

        const additionalCharacters = await CharacterModel.find({
            _id: {
                $in: characterIdsFromSeries.filter(id => !existingCharacterIds.has(id))
            }
        })
        .select('_id name gender characterImage species role seriesName tags')
        .lean();

        const allCharacters = uniqueById([...directCharacterMatches, ...additionalCharacters]);

        const matchedCategories = await CategoryModel.find({
            $or: regexes.map(r => ({ categoryName: r }))
        })
        .populate({
            path: "seriesNames",
            select: "_id seriesName originalLanguage genre tags coverImage characters",
            populate: {
                path: "characters",
                select: "_id name gender characterImage species role seriesName tags"
            }
        })
        .lean();

        let categorySeries = [];
        let categoryCharacters = [];

        matchedCategories.forEach(cat => {
            if (Array.isArray(cat.seriesNames)) {
                cat.seriesNames.forEach(series => {
                    categorySeries.push(series);
                    if (Array.isArray(series.characters)) {
                        categoryCharacters.push(...series.characters);
                    }
                });
                cat.seriesNames = [];
            }
        });

        categoryCharacters = uniqueById(categoryCharacters);

        const finalSeries = uniqueById([...directSeriesMatches, ...categorySeries]);
        const finalCharacters = uniqueById([...allCharacters, ...categoryCharacters]);

        const userMatches = await UserModel.find({
            $or: regexes.map(r => ({ username: r }))
        }).lean();

        res.json({
            series: finalSeries,
            characters: finalCharacters,
            categories: matchedCategories,
            users: userMatches
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Server error during search' });
    }
};