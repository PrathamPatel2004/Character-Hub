import React, { useState, useEffect } from 'react';
import useFollowUser from '../Hooks/useFollow';
import useComments from '../Hooks/useComments.jsx';
import { useAuth } from '../Contexts/AuthContext.jsx';
import { Link, useParams } from 'react-router-dom';
import Not_Found_Icon from '/Not_Found_Icon.svg';
import SendIcon from '@mui/icons-material/Send';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CharacterCard from '../Components/CharacterCard';
import CommentCard from '../Components/CommentCard';
import toast from 'react-hot-toast';
import SeriesCard from '../Components/SeriesCard';
import { API_BASE_URL } from '../Utils/App.js';

const CharacterPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [character, setCharacter] = useState(null);
    const [characters, setCharacters] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { comments, loading: loadingComments, addComment, addReply, toggleLike, deleteComment } = useComments({ characterId: id });
    const [commentText, setCommentText] = useState("");
    const [sortBy, setSortBy] = useState("recent");
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [characterDataRes, charactersRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/characters/character/${id}`, { method : 'GET', credentials : 'include' }),
                    fetch(`${API_BASE_URL}/api/characters/all-characters`, { method : 'GET', credentials : 'include' }),
                ]);

                if (characterDataRes.ok) {
                    const characterData = await characterDataRes.json();
                    setCharacter(characterData.character);
                } else {
                    toast.error(`Failed to fetch character: ${characterDataRes.statusText}`);
                }

                if (charactersRes.ok) {
                    const charactersData = await charactersRes.json();
                    setCharacters(charactersData.characters);
                } else {
                    toast.error(`Failed to fetch characters: ${charactersRes.statusText}`);
                }

            } catch (err) {
                console.error('Failed to load data', err);
                toast.error('Failed to load data');
            } finally {
                setTimeout(() => {
                    setLoadingData(false);
                }, 300);
            }
        };
        fetchData();
    }, [id]);

    const addedById = character?.addedBy?._id;
    const { isFollowing, toggleFollow, loading } = useFollowUser(addedById || '');

    const handleFollow = async () => {
        setLoadingData(true);
        if (!user) {
            toast.error('You must be logged in to follow users!');
            return setLoadingData(false);
        }

        const success = await toggleFollow();

        if (success) {
            setCharacter((prev) => {
                if (!prev) return prev;

                const isCurrentlyFollowing = isFollowing;
                const updatedFollowers = isCurrentlyFollowing
                    ? prev.addedBy.followers.filter((id) => id !== user._id)
                    : [...prev.addedBy.followers, user._id];

                return {
                    ...prev,
                    addedBy: {
                        ...prev.addedBy,
                        followers: updatedFollowers
                    }
                };
            });

            setTimeout(() => {
                setLoadingData(false);
            }, 300);
        }
    }

    const nextImage = () => {
        if (character?.imageGallery?.length) {
            setCurrentImageIndex((prev) => prev === character.imageGallery.length - 1 ? 0 : prev + 1 );
        }
    };

    const prevImage = () => {
        if (character?.imageGallery?.length) {
            setCurrentImageIndex((prev) => prev === 0 ? character.imageGallery.length - 1 : prev - 1 );
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim()) return toast.error("Comment cannot be empty");
        const newComment = await addComment(commentText);
        if (newComment) setCommentText("");
    };

    const relatedToSameSeries = characters
        .filter((c) => c.seriesName?._id === character?.seriesName?._id && c._id !== character?._id).slice(0, 5);

    const sameAuthorCharacters = characters
        .filter((c) => c.addedBy?._id === character?.addedBy?._id && c._id !== character?._id).slice(0, 4);

    const similarCharacters = characters
        .filter((c) => c.tags?.some((tag) => character?.tags?.includes(tag)) && c._id !== character?._id).slice(0, 8);
    
    const sortedComments = [...comments].sort((a, b) => {
        if (sortBy === "liked") {
            return (b.likes?.length || 0) - (a.likes?.length || 0);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-[100dvh]">
                <p className="text-gray-500 text-lg">Loading characters data...</p>
            </div>
        )
    }

    if (!character) {
        return (
            <div className="flex items-center justify-center min-h-[100vh]">
                <p className="text-gray-500 text-lg">Characters not found</p>
            </div>
        );
    }

    if (loading === true) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading character...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="relative overflow-hidden m-4 aspect-[5/2]">
                <img
                    src={character.coverImage}
                    alt={`${character.seriesName?.seriesName} cover`}
                    className="object-contain w-full h-full rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-50 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className='flex justify-center items-center aspect-[1/1]'>
                                    <img
                                        src={character.characterImage}
                                        alt={character.name}
                                        className="w-40 h-40 rounded-xl object-cover border-4 border-white shadow-lg"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-center items-center mb-4">
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{character.name}</h1>
                                            <p className="text-lg text-blue-600 font-medium mb-2">
                                                {character.seriesName?.seriesName || character.seriesName}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {character.tags?.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-sm text-sm font-medium"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-4">
                                        <div>
                                            <p className="text-gray-500">Gender</p>
                                            <p className="font-medium text-gray-900">{character.gender}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Species</p>
                                            <p className="font-medium text-gray-900">{character.species}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Role</p>
                                            <p className="font-medium text-gray-900">{character.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Gallery</h3>
                            {character.imageGallery?.length > 0 ? (
                                <div className="relative">
                                    <div className="aspect-video rounded-lg overflow-hidden">
                                        <img
                                            src={character.imageGallery[currentImageIndex]}
                                            alt={`${character.name} gallery ${currentImageIndex + 1}`}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-3 top-1/2 -translate-y-1/2  bg-transparent hover:bg-blue-200 hover:text-white p-2 rounded-full"
                                    >
                                        <ChevronLeftIcon className='w-8 h-8'/>
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-3 top-1/2 -translate-y-1/2  bg-transparent hover:bg-blue-200 hover:text-white p-2 rounded-full"
                                    >
                                        <ChevronRightIcon className='w-8 h-8'/>
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                        {character.imageGallery.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No gallery images available.</p>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Origin</h3>
                                <p className="text-gray-700">{character.origin}</p>
                            </div>
                          
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Description</h3>
                                <p className="text-gray-700 leading-relaxed">{character.description}</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">Character From Following Series</h2>
                                <div className="w-auto px-4">
                                    <SeriesCard key={character.seriesName?._id} series={character.seriesName} />
                                </div>
                            </div>
                          
                            {character.facts?.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Facts</h3>
                                    <ul className="space-y-2">
                                        {character.facts.map((fact, i) => (
                                            <li key={i} className="text-gray-700">• {fact}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {character.achievements?.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Achievements</h3>
                                    <ul className="space-y-2">
                                        {character.achievements.map((ach, i) => (
                                            <li key={i} className="text-gray-700">🏆 {ach}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Comments</h3>
                            <div className="flex gap-3 mb-4">
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="w-full p-3 border border-gray-500 rounded-lg resize-none"
                                    rows="3"
                                />
                            </div>
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={handleAddComment}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <SendIcon className="h-4 w-4" />
                                    Comment
                                </button>
                            </div>
                            {loadingComments && <p className="text-gray-500">Loading comments...</p>}

                            <div className="space-y-4">
                                <div className="flex justify-between pt-4 px-1">
                                    <h3 className='text-gray-900 text-xl'>Comments ({comments.length}) </h3>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="border rounded p-2"
                                    >
                                        <option value="recent">Most Recent</option>
                                        <option value="liked">Most Liked</option>
                                    </select>
                                </div>
                                
                                {comments.length === 0 && !loadingComments && (
                                    <div className="p-20 flex items-center justify-center">
                                        <p className="text-gray-500 text-center">No comments yet</p>
                                    </div>
                                )}
                                
                                <div className="space-y-4">
                                    {sortedComments.slice(0, 10).map((comment) => (
                                        <CommentCard
                                            key={comment._id}
                                            comment={comment}
                                            onReply={addReply}
                                            onLike={toggleLike}
                                            onDelete={deleteComment}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>        
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Added by</h3>
                            <div className="flex flex-col items-center justify-center sm:flex-row lg:flex-col sm:gap-10 lg:gap-4 px-5 gap-4">
                                <img
                                    src={character.addedBy?.profilePic || Not_Found_Icon }
                                    alt={character.addedBy?.username}
                                    className="w-25 h-25 rounded-full object-cover border border-blue-600 flex-shrink-0"
                                />
                                {addedById == user?._id ? (
                                    <div className='flex flex-col items-center justify-center'>
                                        <Link to={`user/${addedById}`}>
                                            <h3 className="font-medium text-gray-900 text-xl mb-1">
                                                {character.addedBy?.username || character.addedBy}
                                            </h3>
                                        </Link>
                                        <h5 className='font-small text-gray-500 text-lg mb-2'>
                                            {character.addedBy?.followers?.length} Followers
                                        </h5>
                                        <Link
                                            to={`/add-profile-info/${addedById}`}
                                            className="flex items-center gap-2 px-4 py-1.5 rounded-sm button text-white bg-blue-700"
                                        >
                                            Edit Profile
                                        </Link>
                                    </div>
                                ) : (
                                    <div className='flex flex-col items-center justify-center'>
                                        <Link to={`/user/${addedById}`}>
                                            <h3 className="font-medium text-gray-900 text-xl mb-1">
                                                {character.addedBy?.username || character.addedBy}
                                            </h3>
                                        </Link>
                                        <h5 className="font-small text-gray-500 text-lg mb-2">
                                            {character.addedBy?.followers?.length} Followers
                                        </h5>
                                        <button
                                            onClick={handleFollow}
                                            disabled={loading}
                                            className={`flex items-center gap-2 px-4 py-1.5 rounded-sm transition-colors ${
                                                isFollowing
                                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                        >
                                            {loading ? 'Processing...' : isFollowing ? 'Unfollow' : 'Follow'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {relatedToSameSeries.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    From {character.seriesName?.seriesName}
                                </h2>
                                <div className="space-y-4">
                                    {relatedToSameSeries.map((char) => (
                                        <Link key={char._id} to={`/character/${char._id}`} className="flex gap-10 justify-start lg:gap-4">
                                            <img src={char.characterImage} alt={char.name} className="w-16 h-16 rounded-lg object-cover" />
                                            <div>
                                                <p className="text-sm font-medium">{char.name}</p>
                                                <p className="text-xs text-gray-500">{char.role}</p>
                                                <div className="flex flex-wrap gap-1 my-1">
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
                                    ))}
                                </div>
                            </div>
                        )}
                        {sameAuthorCharacters.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    More by {character.addedBy?.username}
                                </h2>
                                <div className="space-y-4">
                                    {sameAuthorCharacters.map((char) => (
                                        <Link key={char._id} to={`/character/${char._id}`} className="flex gap-10 justify-start lg:gap-4">
                                            <img src={char.characterImage} alt={char.name} className="w-16 h-16 rounded-lg object-cover" />
                                            <div>
                                                <p className="text-sm font-medium">{char.name}</p>
                                                <p className="text-xs text-gray-500">{char.seriesName?.seriesName}</p>
                                                <div className="flex flex-wrap gap-1 my-1">
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
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                        
                {similarCharacters.length > 0 ? (
                    <div className="pb-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Characters</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {similarCharacters.map((char) => (
                                <CharacterCard key={char._id} character={char} />
                            ))}            
                        </div>
                    </div>
                ) : (
                    <div></div>
                )}          
            </div>
        </div>
    );
};
export default CharacterPage;
