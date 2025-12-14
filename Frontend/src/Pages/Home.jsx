import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CharacterCard from '../Components/CharacterCard';
import SeriesCard from '../Components/SeriesCard';
import EmptyData from '/EmptyData.png'
import toast from 'react-hot-toast';

const Home = () => {
    const [series, setSeries] = useState([]);
    const [characters, setCharacters] = useState([]);
    const [categories, setCategories] = useState([]);
    const [recentCharacters, setRecentCharacters ] = useState([]);
    const [recentSeries, setRecentSeries ] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const API = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, charactersRes, seriesDataRes, userDataRes] = await Promise.all([
                    fetch(`${API}/api/categories/all-categories`, { method: 'GET', credentials: 'include' }),
                    fetch(`${API}/api/characters/all-characters`, { method: 'GET', credentials: 'include' }),
                    fetch(`${API}/api/series/all-series`, { method: 'GET', credentials: 'include' }),
                    fetch(`${API}/api/auth/allUsers`, { method: 'GET', credentials: 'include' }),
                ]);

                if (categoriesRes.ok) {
                    const categoriesData = await categoriesRes.json();
                    if (categoriesData && categoriesData.categories && Array.isArray(categoriesData.categories)) {
                        setCategories(categoriesData.categories);
                    } else {
                        setCategories([]);
                        toast.error('No categories data found');
                    }
                } else {
                    setCategories([]);
                    toast.error(`Failed to fetch categories: ${categoriesRes.statusText}`);
                }

                if (charactersRes.ok) {
                    const charactersData = await charactersRes.json();
                    setCharacters(charactersData.characters);
                } else {
                    throw new Error(`Failed to fetch characters: ${charactersRes.statusText}`);
                }

                if (seriesDataRes.ok) {
                    const seriesData = await seriesDataRes.json();
                    setSeries(seriesData.series);
                } else {
                    throw new Error(`Failed to fetch characters: ${seriesDataRes.statusText}`);
                }

                if (userDataRes.ok) {
                    const userData = await userDataRes.json();
                    setUsers(userData.users);
                } else {
                    setUsers([]);
                    throw new Error(`Failed to fetch characters: ${userDataRes.statusText}`);
                }
            } catch (err) {
                console.error('Failed to load data', err);
                toast.error('Failed to load data');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (characters.length > 0) {
            const now = Date.now();
            const recent = characters.filter((character) => {
                if (!character.createdAt) return false; 
                const created = new Date(character.createdAt).getTime();
                return now - created < 15 * 24 * 60 * 60 * 1000;
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 6);
            setRecentCharacters(recent);
        }

        if (series.length > 0) {
            const now = Date.now();
            const recentSeries = series.filter((series) => {
                if (!series.createdAt) return false; 
                const created = new Date(series.createdAt).getTime();
                return now - created < 15 * 24 * 60 * 60 * 1000;
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
            setRecentSeries(recentSeries);
        }

        setLoadingData(false);
    }, [characters, series]);

    if (loadingData) {
        return null;
    }

    return (
        <div className="min-h-screen">
            <section className="relative py-8 md:py-14 lg:py-20 px-4 sm:px-6 lg:px-8 m-3 rounded-lg">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-300 to-purple-900 bg-clip-text text-transparent">
                        Discover Amazing Characters
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Explore a vast collection of characters from Anime, Manga, Movies, and more. 
                        Create detailed Profiles, discover new favorites, and connect with fellow fans.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/characters"
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Browse Characters
                        </Link>
                        <Link
                            to="/series"
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Browse Series
                        </Link>
                    </div>
                </div>
            </section>

            <hr className="mx-4 sm:mx-8 md:mx-12 lg:mx-20 border-gray-400" />

            <section className="relative py-8 md:py-14 lg:py-20 px-4 sm:px-6 lg:px-8 m-3 rounded-lg">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Share Your Knowledge of Characters and Series
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Add Series and Characters data to share with community and share unknown facts about them.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/add-character"
                            className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                        >
                            Add Character
                        </Link>
                        <Link
                            to="/add-series"
                            className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                        >
                            Add Series
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-between px-16">
                        <div className="text-center">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUpIcon className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">{characters?.length}</div>
                            <div className="text-gray-600">Characters</div>
                        </div>
                        <div className="text-center">
                            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LiveTvIcon className="h-8 w-8 text-purple-600" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">{series?.length}</div>
                            <div className="text-gray-600">Series</div>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AccountCircleIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">{users?.length}</div>
                            <div className="text-gray-600">Users</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Categories</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {categories?.map((category) => (
                            <Link
                                key={category._id}
                                to={`/categories?category=${category.slug}`}
                                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-6 hover:from-blue-100 hover:to-purple-100 transition-all duration-300"
                            >
                                <div className='grid grid-rows-1 flex justify-center items-center gap-3 hover:scale-110 transition-all'>
                                    <img 
                                        src={category.icon}
                                        alt={category.category}
                                        className='w-30 h-30 items-center flex justify-center'
                                    />
                                    <h3 className="font-bold text-gray-900 mb-2">{category.category}</h3>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-300" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <h5 className="font-bold sm:text-xl md:text-2xl lg:text-3xl">Recently Add Characters</h5>
                        <Link to="/characters" className="text-blue-500 hover:text-blue-800 font-medium">
                            View All Characters
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid:cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {recentCharacters?.map((character) => (
                            <CharacterCard key={character._id} character={character} />
                        ))}
                    </div>
                    {recentCharacters.length === 0 && (
                        <div className='flex flex-col justify-center items-center'>
                            <img
                                src={EmptyData}
                                alt='No Recent Data'
                                className='w-48 h-48'
                            />
                            <p className="text-gray-600">No Recently Added Characters From last 15 days</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <h5 className="font-bold sm:text-xl md:text-2xl lg:text-3xl">Recently Add Series</h5>
                        <Link to="/series" className="text-blue-500 hover:text-blue-800 font-medium">
                            View All Series
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {recentSeries?.map((series) => (
                            <SeriesCard key={series._id} series={series} />
                        ))}
                    </div>
                    {recentSeries.length === 0 && (
                        <div className='flex flex-col justify-center items-center'>
                            <img
                                src={EmptyData}
                                alt='No Recent Data'
                                className='w-48 h-48'
                            />
                            <p className="text-gray-500 mb-8">No Recently Added Series From last 15 days</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );  
};

export default Home;