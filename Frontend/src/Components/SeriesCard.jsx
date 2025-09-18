import { Link } from 'react-router-dom';
import NoImageFound from '/NoImageFound.svg';

const SeriesCard = ({ series }) => {
    const imageUrl = typeof series.coverImage === 'string'
        ? series.coverImage
        : series.coverImage?.url || NoImageFound;

    return (
        <Link
            to={`/series/${series._id || series.id}`}
            className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
        >
        <div className="relative overflow-hidden aspect-w-1 aspect-h-1 flex items-center justify-center aspect-[5/2]">
            <img
                src={imageUrl}
                alt={series.seriesName}
                className="object-contain group-hover:scale-105 transition-transform duration-300"
            />
            {series.category && (
                <div className="absolute top-3 left-3">
                <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                    {series.category?.category}
                </span>
            </div>
            )}
        </div>
        
        <hr className="border-red-500 mx-5 mt-2" />
        <div className="p-4">
            <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {series.seriesName || 'Unnamed Character'}
            </h3>

            <div className="flex flex-wrap gap-1 my-3">
                {(series.tags || []).slice(0, 4).map((tag, index) => (
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

export default SeriesCard;
