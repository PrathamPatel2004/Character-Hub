import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import SeriesCard from '../Components/SeriesCard';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GridViewIcon from '@mui/icons-material/GridView';
import toast from 'react-hot-toast';
import Not_Found_Icon from '/Not_Found_Icon.svg';
import Category_All from '/Category_All.png';

const CategoryButton = ({ slug, name, icon, selectedCategory, onClick }) => (
    <button
        onClick={() => onClick(slug)}
        className={`flex items-center px-4 py-2 rounded-lg text-sm border capitalize transition ${
            selectedCategory === slug
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border-gray-300'
        }`}
        aria-label={`Filter by ${name}`}
    >

       {typeof icon === 'string' ? (
            <img src={icon} className="w-6 h-6 mr-2" alt={name} />
        ) : React.isValidElement(icon) ? (
            <span className="w-6 h-6 mr-2">{icon}</span>
        ) : null}
            {name}
    </button>
);

const Series = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [series, setSeries] = useState([]);
    const [categories, setCategories] = useState([]);
    const initialCategory = searchParams.get('category') || 'all';
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [viewMode, setViewMode] = useState('grid');
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, seriesDataRes] = await Promise.all([
                    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/categories/all-categories`, { method: 'GET', credentials: 'include' }),
                    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/series/all-series`, { method: 'GET', credentials: 'include' }),
                ]);

                if (categoriesRes.ok) {
                    const categoriesData = await categoriesRes.json();
                    if (categoriesData && Array.isArray(categoriesData.categories)) {
                        const sanitizedCategories = categoriesData.categories.map((cat) => ({
                            ...cat,
                            icon: typeof cat.icon === 'string' ? cat.icon : '', // sanitize icon
                        }));
                        setCategories(sanitizedCategories);
                    } else {
                        setCategories([]);
                        toast.error('No categories data found');
                    }
                } else {
                    setCategories([]);
                    toast.error(`Failed to fetch categories: ${categoriesRes.statusText}`);
                }

                if (seriesDataRes.ok) {
                    const seriesData = await seriesDataRes.json();
                    setSeries(seriesData.series);
                } else {
                    throw new Error(`Failed to fetch characters: ${seriesDataRes.statusText}`);
                }
            } catch (err) {
                console.error('Failed to load data', err);
                toast.error('Failed to load data');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const urlCategory = searchParams.get('category') || 'all';
        if (urlCategory !== selectedCategory) {
            setSelectedCategory(urlCategory);
            setLoadingData(true);

            setTimeout(() => {
                setLoadingData(false);
            }, 300);
        }
    }, [searchParams, selectedCategory]);

    const handleCategoryChange = (slug) => {
        if (slug !== selectedCategory) {
            setLoadingData(true);
            setSelectedCategory(slug);
            navigate(`?category=${slug}`);
        }
    };

    const selectedCategoryName =
        selectedCategory === 'all'
            ? 'All'
            : categories.find((cat) => cat.slug === selectedCategory)?.category || selectedCategory;

    const filteredSeries =
        (selectedCategory === 'all'
            ? series
            : series.filter((s) => s.category?.slug?.toLowerCase() === selectedCategory.toLowerCase())
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Series by Category</h1>
                    <p className="text-gray-600">Select a category to filter Series</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6 items-center">
                    <CategoryButton
                        slug="all"
                        name="All"
                        icon={<img src={Category_All} className="w-5 h-5 mr-2" alt="All" />}
                        selectedCategory={selectedCategory}
                        onClick={handleCategoryChange}
                    />

                    {categories.length > 0 ? (
                        categories.map((cat) => (
                            <CategoryButton
                                key={cat._id}
                                slug={cat.slug}
                                name={cat.category}
                                icon={cat.icon}
                                selectedCategory={selectedCategory}
                                onClick={handleCategoryChange}
                            />
                        ))
                    ) : (
                        <p>No categories found</p>
                    )}

                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 ml-auto">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                            aria-label="Grid View"
                        >
                            <GridViewIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                            aria-label="List View"
                        >
                            <FormatListBulletedIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="mb-6">
                    {loadingData === true ? (
                        <div className="flex items-center justify-center min-h-[50vh]">
                            <p className="text-gray-500 text-lg">Loading series...</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-600 mb-2">
                                Showing {filteredSeries.length} Series{filteredSeries.length !== 1 } in{' '}
                                <strong className="capitalize">{selectedCategoryName}</strong>
                            </p>

                            {filteredSeries.length > 0 ? (
                                viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredSeries.map((series) => (
                                            <SeriesCard key={series._id} series={series} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredSeries.map((series) => (
                                            <Link
                                                to={`/series/${series._id}`}
                                                key={series._id}
                                                className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex gap-4">
                                                    <img
                                                        src={series.coverImage}
                                                        alt={series.seriesName}
                                                        className="flex w-50 h-24 sm:w-52 sm:h-28 rounded-lg object-cover flex-shrink-0 justify-center items-center"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex flex-wrap gap-3 mb-2 sm:mb-3 items-center">
                                                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{series.seriesName}</h3>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mb-2 sm:mb-3">
                                                            {series.tags?.slice(0, 3).map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs sm:text-sm"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                                                            <span>{series.category?.category || series.category} Series</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-12">
                                    <div className="mb-5 flex justify-center items-center">
                                        <img
                                            src={Not_Found_Icon}
                                            alt="Not-Found-Icon"
                                            className="w-[40%] sm:w-[30%] md:w-[20%] lg:w-[15%] h-auto"
                                        />
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-900 mb-2">No Series found</h3>
                                    <p className="text-gray-600">Try selecting a different category or clear your search</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
    
export default Series;
