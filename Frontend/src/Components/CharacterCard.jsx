import { Link } from 'react-router-dom';
import NoImageFound from '/NoImageFound.svg';

const CharacterCard = ({ character }) => {
    const imageUrl = typeof character.characterImage === 'string'
            ? character.characterImage
            : character.characterImage?.url || NoImageFound;

    return (
        <Link
            to={`/character/${character._id || character.id}`}
            className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-blue-300 border-3"
        >
            <div className="relative overflow-hidden aspect-[1/1] flex items-center justify-center">
                <img
                    src={imageUrl}
                    alt={character.name}
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                />
                {character.seriesName?.seriesName && (
                    <div className="absolute top-3 left-3">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                            {character.seriesName.seriesName}
                        </span>
                    </div>
                )}
            </div>

            <hr className="border-red-500 mx-2.5 mt-2" />
            <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {character.name || 'Unnamed Character'}
                </h3>

                <div className="flex flex-wrap gap-1 my-3">
                    {(character.tags || []).slice(0, 2).map((tag, index) => (
                        <span
                            key={tag + index}
                            className="bg-gray-200 text-blue-700 px-2 py-1 rounded-xs text-xs"
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