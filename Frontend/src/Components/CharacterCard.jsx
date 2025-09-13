import { Link } from 'react-router-dom';
import Not_Found_Icon from '/Not_Found_Icon.svg';

const CharacterCard = ({ character }) => {
    const imageUrl = typeof character.characterImage === 'string'
        ? character.characterImage
        : character.characterImage?.url || Not_Found_Icon;

    const series = typeof character.seriesName === 'string'
        ? character.seriesName
        : character.seriesName?.seriesName || 'Unknown Series';

    return (
        <Link
            to={`/character/${character._id || character.id}`}
            className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
        >
            <div className="relative overflow-hidden aspect-w-1 aspect-h-1 flex items-center justify-center border border-4 border-gray-200">
                <img
                    src={imageUrl}
                    alt={character.name}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = Not_Found_Icon;
                    }}
                    className="w-52 h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {series}
                    </span>
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {character.name || 'Unnamed Character'}
                </h3>

                <div className="flex flex-wrap gap-1 mb-3">
                    {(character.tags || []).slice(0, 2).map((tag, index) => (
                        <span
                            key={tag + index}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
};

export default CharacterCard;