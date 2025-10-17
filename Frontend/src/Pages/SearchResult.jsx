import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import CharacterCard from '../Components/CharacterCard';
import SeriesCard from '../Components/SeriesCard';
import AddIcon from '@mui/icons-material/Add';
import Sad from '/Sad.webp';

const SearchResults = () => {
    const [activeTab, setActiveTab] = useState(null);
    const location = useLocation();
    const { results } = location.state || {};

    useEffect(() => {
        if (!results) return;

        if (
            results.characters?.length > 0 ||
            results.charactersFromSeries?.length > 0 ||
            results.characterFromCategory?.length > 0
        ) {
            setActiveTab('characters');
        } else if (results.series?.length > 0) {
            setActiveTab('series');
        } else if (results.categories?.length > 0) {
            setActiveTab('categories');
        } else if (results.users?.length > 0) {
            setActiveTab('users');
        } else {
            setActiveTab(null);
        }
    }, [results]);

    if (
        !results || (!results.characters?.length &&
        !results.charactersFromSeries?.length &&
        !results.characterFromCategory?.length &&
        !results.series?.length &&
        !results.categories?.length &&
        !results.users?.length)
    ) {
        return <div className="text-center py-12">No results found.</div>;
    }

    const allCharacters = [
        ...(results.characters || []),
        ...(results.charactersFromSeries || []),
        ...(results.characterFromCategory || [])
    ];

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex space-x-8 mb-8">
                    <button
                        onClick={() => setActiveTab('characters')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'characters'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Characters ({allCharacters.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('series')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'series'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Series ({results.series?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'categories'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Categories ({results.categories?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'users'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Users ({results.users?.length || 0})
                    </button>
                </nav>

                {activeTab === 'characters' && (
                    <div>
                        <div className="flex justify-between items-center my-4">
                            <h2 className="text-2xl font-bold text-gray-900">Characters</h2>
                            <Link
                                to="/add-character"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <AddIcon className="h-4 w-4" />
                                Add New Character
                            </Link>
                        </div>

                        {allCharacters.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {allCharacters.map((character) => (
                                    <CharacterCard key={character._id || character.id} character={character} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🎭</div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No characters found</h3>
                                <p className="text-gray-600 mb-6">Start building your character collection!</p>
                                <Link
                                    to="/add-character"
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                                >
                                    <AddIcon className="h-5 w-5" />
                                    Add Character
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'series' && (
                    <div>
                        <div className="flex justify-between items-center my-4">
                            <h2 className="text-2xl font-bold text-gray-900">Series</h2>
                            <Link
                                to="/add-series"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <AddIcon className="h-4 w-4" />
                                Add New Series
                            </Link>
                        </div>

                        {results.series?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {results.series.map((series) => (
                                    <SeriesCard key={series._id || series.id} series={series} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🎭</div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No series found</h3>
                                <p className="text-gray-600 mb-6">Start adding some stories!</p>
                                <Link
                                    to="/add-series"
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                                >
                                    <AddIcon className="h-5 w-5" />
                                    Add Series
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div>
                        <div className="flex justify-between items-center my-4">
                            <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
                        </div>

                        {results.categories?.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                                {results.categories.map((category) => (
                                    <Link
                                        key={category._id}
                                        to={`/categories?category=${category.slug}`}
                                        className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-6 hover:from-blue-100 hover:to-purple-100 transition-all duration-300"
                                    >
                                        <div className='grid grid-rows-1 flex justify-center items-center gap-3 hover:scale-110 transition-all'>
                                            <img
                                                src={category.icon}
                                                alt={category.category}
                                                className='w-40 h-40 items-center'
                                            />
                                            <h3 className="font-bold text-gray-900 mb-2">{category.category}</h3>
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-300" />
                                        </div>
                                    </Link>
                                ))}   
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🎭</div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No categories found</h3>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="mt-5 p-2">
                        {results.users?.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {results.users.map((user) => (
                                    <Link
                                        key={user._id}
                                        to={`/user/${user._id}`}
                                        className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-6 hover:from-blue-100 hover:to-purple-100 transition-all duration-300"
                                    >
                                        <div className='grid grid-rows-1 flex justify-center items-center gap-3 hover:scale-105 transition-all'>
                                            <img
                                                src={user.profilePic || Sad}
                                                alt={user.username}
                                                className="w-20 h-20 object-cover border rounded-full"
                                            />
                                            <h3 className="font-bold text-gray-900 mb-2">{user.username}</h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">👥</div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No users found</h3>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
