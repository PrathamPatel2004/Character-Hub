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
        const regexes = words.map(word => new RegExp(word, 'i'));

        const seriesMatches = await SeriesModel.find({
            $or: regexes.map(r => ({ seriesName: r }))
        })
        .populate('characters', 'name gender characterImage role')
        .populate('category', 'slug category icon');

        const [characterMatches, categoryMatches, userMatches] = await Promise.all([
            CharacterModel.find({ $or: regexes.map(r => ({ name: r })) })
                .populate('seriesName', 'seriesName coverImage category')
                .populate('category', 'slug category icon'),

            CategoryModel.find({ $or: regexes.map(r => ({ category: r })) })
                .populate('seriesNames', '_id seriesName originalLanguage genre tags coverImage characters'),

            UserModel.find({ $or: regexes.map(r => ({ username: r })) })
        ]);

        const seriesIds = seriesMatches.map(s => s._id);
        const categoryIds = categoryMatches.map(c => c._id);

        const [relatedCharactersBySeries, relatedCharactersByCategory] = await Promise.all([
            CharacterModel.find({ seriesName: { $in: seriesIds } })
                .populate('seriesName', 'seriesName coverImage category'),

            CharacterModel.find({ category: { $in: categoryIds } })
                .populate('category', 'slug category icon')
        ]);

        // Optional: De-duplicate character lists if needed
        // const uniqueCharacters = [...new Map(characterMatches.map(c => [c._id.toString(), c])).values()];
        // const uniqueRelatedBySeries = [...new Map(relatedCharactersBySeries.map(c => [c._id.toString(), c])).values()];
        // const uniqueRelatedByCategory = [...new Map(relatedCharactersByCategory.map(c => [c._id.toString(), c])).values()];

        res.json({
                series: seriesMatches,
                characters: characterMatches,
                categories: categoryMatches,
                users: userMatches,
                charactersBySeries: relatedCharactersBySeries,
                charactersByCategory: relatedCharactersByCategory
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Server error during search' });
    }
};
