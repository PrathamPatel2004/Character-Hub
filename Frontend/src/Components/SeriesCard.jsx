import { Link } from 'react-router-dom';
import Not_Found_Icon from '/Not_Found_Icon.svg';

const SeriesCard = ({ series }) => {
    const imageUrl = typeof series.coverImage === 'string'
        ? series.coverImage
        : series.coverImage?.url || Not_Found_Icon;

    return (
        <Link
            to={`/series/${series._id || series.id}`}
            className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
        >
        <div className="relative overflow-hidden aspect-w-1 aspect-h-1 flex items-center justify-center">
            <img
                src={imageUrl}
                alt={series.seriesName}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = Not_Found_Icon;
                }}
                className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {series.category && (
                <div className="absolute top-3 left-3">
                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {series.category?.category}
                </span>
            </div>
            )}
        </div>

        <div className="p-4">
            <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {series.seriesName || 'Unnamed Character'}
            </h3>

            <div className="flex flex-wrap gap-1 mb-3">
                {(series.tags || []).slice(0, 2).map((tag, index) => (
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

export default SeriesCard;
