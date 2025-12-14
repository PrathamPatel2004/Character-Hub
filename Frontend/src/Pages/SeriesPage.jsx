import React, { useState, useEffect } from 'react';
import useFollowUser from '../Hooks/useFollow';
import useComments from '../Hooks/useComments';
import { useAuth } from '../Contexts/AuthContext';
import { Link, useParams } from 'react-router-dom';
import Not_Found_Icon from '/Not_Found_Icon.svg';
import AddIcon from '@mui/icons-material/Add'
import SendIcon from '@mui/icons-material/Send';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CharacterCard from '../Components/CharacterCard';
import CommentCard from '../Components/CommentCard';
import toast from 'react-hot-toast';

const SeriesPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [multipleSeries, setMultipleSeries] = useState([]);
    const [series, setSeries] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { comments, loading: loadingComments, addComment, addReply, toggleLike, deleteComment } = useComments({ characterId: id });
    const [commentText, setCommentText] = useState("");
    const [sortBy, setSortBy] = useState("recent");
    const [loadingData, setLoadingData] = useState(true);
    const API = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [seriesDataRes, allSeriesDataRes] = await Promise.all([
                    fetch(`${API}/api/series/series/${id}`, { method: 'GET', credentials: 'include' }),
                    fetch(`${API}/api/series/all-series`, { method: 'GET', credentials: 'include' }),
                ]);
  
                if (seriesDataRes.ok) {
                    const seriesData = await seriesDataRes.json();
                    setSeries(seriesData.series);
                } else {
                    toast.error(`Failed to fetch categories: ${seriesDataRes.statusText}`);
                }
  
                if (allSeriesDataRes.ok) {
                    const multipleSeriesData = await allSeriesDataRes.json();
                    setMultipleSeries(multipleSeriesData.series);
                } else {
                    throw new Error(`Failed to fetch characters: ${allSeriesDataRes.statusText}`);
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

    const addedById = series?.addedBy?._id;
    const { isFollowing, toggleFollow, loading } = useFollowUser(addedById || '');

    const nextImage = () => {
        if (series?.imageGallery?.length) {
            setCurrentImageIndex((prev) =>
                prev === series.imageGallery.length - 1 ? 0 : prev + 1
            );
        }
    };
    
    const prevImage = () => {
        if (series?.imageGallery?.length) {
            setCurrentImageIndex((prev) =>
            prev === 0 ? series.imageGallery.length - 1 : prev - 1 );
        }
    };
    
    const handleAddComment = async () => {
        if (!commentText.trim()) return toast.error("Comment cannot be empty");
        const newComment = await addComment(commentText);
        if (newComment) setCommentText("");
    };

    const handleFollow = async () => {
        setLoadingData(true);
        if (!user) {
            toast.error('You must be logged in to follow users!');
            return setLoadingData(false);
        }

        const success = await toggleFollow();

        if (success) {
            setSeries((prev) => {
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

    const sameAuthorSeries = (multipleSeries || [])
        .filter((s) => s.addedBy?._id === series?.addedBy?._id && s._id !== series?._id).slice(0, 4);

    const similarSeries = (multipleSeries || [])
        .filter((s) => s.tags?.some((tag) => series?.tags?.includes(tag)) && s._id !== series?._id).slice(0, 4)

    const sortedComments = [...comments].sort((a, b) => {
        if (sortBy === "liked") {
            return (b.likes?.length || 0) - (a.likes?.length || 0);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-[100dvh]">
                <p className="text-gray-500 text-lg">Loading series data...</p>
            </div>
        )
    }

    if (!series) {
        return (
            <div className="flex items-center justify-center min-h-[100vh]">
                <p className="text-gray-500 text-lg">Series not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="relative overflow-hidden m-4 aspect-[5/2]">
                <img
                    src={series.coverImage}
                    alt={`${series.seriesName} Cover`}
                    className="object-contain w-full h-full rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 -mt-50 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 pb-16">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                           <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">{series.seriesName}</h1>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                                <div className="text-center p-4 bg-orange-50 rounded-lg gap-4">
                                    <div className="text-sm text-gray-800 font-medium">Category</div>
                                    <div className="text-xl font-bold text-blue-600 mb-1">
                                        {series.category?.category}
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-orange-50 rounded-lg gap-4">
                                    <div className="text-sm text-gray-800 font-medium">Characters Add</div>
                                    <div className="text-xl font-bold text-blue-600 mb-1">
                                        {series.characters?.length || 0}
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-orange-50 rounded-lg gap-4">
                                    <div className="text-sm text-gray-800 font-medium">Original Language</div>
                                    <div className="text-xl font-bold text-blue-600 mb-1">
                                        {series.originalLanguage}
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-orange-50 rounded-lg gap-4">
                                    <div className="text-sm text-gray-800 font-medium">Status</div>
                                    <div className="text-xl font-bold text-blue-600 mb-1">
                                        {series.status}
                                    </div>
                                </div>
                            </div>
                            {series.tags?.length > 0 && (
                                <div className="mt-8">
                                    <h4 className="text-md font-semibold text-gray-800 m-3">Tags:</h4>
                                    <div className="flex flex-wrap gap-2 items-center justify-center">
                                        {series?.tags?.map((tag) => (
                                            <span
                                                key={tag} 
                                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-sm text-sm font-medium"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {series?.imageGallery?.length > 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Gallery</h3>
                                <div className="relative">
                                    <div className="aspect-video rounded-lg overflow-hidden">
                                        <img
                                            src={series.imageGallery[currentImageIndex]}
                                            alt={`${series.seriesName} gallery ${currentImageIndex + 1}`}
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
                                        {series.imageGallery.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`w-2 h-2 rounded-full ${
                                                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Gallery</h3>
                                <p className="text-gray-500 italic">No gallery images available for this character yet.</p>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Description</h3>
                                <p className="text-gray-700 flex items-center">
                                    {series.description}
                                </p>
                            </div>
                            <div className="mt-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Some Characters from series</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {series.characters?.slice(0, 4).map((char) => (
                                        <CharacterCard key={char._id} character={char} />
                                    ))}
                                </div>
                            </div>
                                
                            {(series.category?.category === "Anime" || series.category?.category === "Movie" || series.category?.category === "tv shows") && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="text-center p-4 bg-yellow-200 rounded-lg gap-4">
                                        <div className="text-sm text-gray-800 font-medium">Production Studio</div>
                                        <div className="text-xl font-bold text-blue-600 mb-1">
                                            {series.productionStudio || "N/A"}
                                        </div>
                                    </div>

                                    <div className="text-center p-4 bg-yellow-200 rounded-lg gap-4">
                                        <div className="text-sm text-gray-800 font-medium">Created By</div>
                                        <div className="text-xl font-bold text-blue-600 mb-1">
                                            {series.createdBy || "N/A"}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(series.category?.category === "books" || series.category?.category === "comics" || series.category?.category === "manga") && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="text-center p-4 bg-yellow-200 rounded-lg gap-4">
                                        <div className="text-sm text-gray-800 font-medium">publication</div>
                                        <div className="text-xl font-bold text-blue-600 mb-1">
                                            {series.publication || "N/A"}
                                        </div>
                                    </div>
                                                    
                                    <div className="text-center p-4 bg-yellow-200 rounded-lg gap-4">
                                        <div className="text-sm text-gray-800 font-medium">Author</div>
                                        <div className="text-xl font-bold text-blue-600 mb-1">
                                            {series.Author || "N/A"}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="text-center p-4 bg-yellow-200 rounded-lg gap-4">
                                    <div className="text-sm text-gray-800 font-medium">Also Available In</div>
                                    <div className="text-xl font-bold text-blue-600 mb-1">
                                        {series.availableIn || "N/A"}
                                    </div>
                                </div>
                    
                                <div className="text-center p-4 bg-yellow-200 rounded-lg gap-4">
                                    <div className="text-sm text-gray-800 font-medium">Genre</div>
                                    <div className="text-xl font-bold text-blue-600 mb-1">
                                        {series.genre || "N/A"}
                                    </div>
                                </div>
                            </div>
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
                                    src={series.addedBy?.profilePic || Not_Found_Icon }
                                    alt={series.addedBy?.username}
                                    className="w-25 h-25 rounded-full object-cover border border-blue-600 flex-shrink-0"
                                />
                                {addedById == user?._id ? (
                                    <div className='flex flex-col items-center justify-center'>
                                        <Link to={`/user/${series.addedBy?._id}`}>
                                            <h3 className="font-medium text-gray-900 text-xl mb-1">
                                                {series.addedBy?.username || series.addedBy}
                                            </h3>
                                        </Link>
                                        <h5 className='font-small text-gray-700 text-lg mb-2'>
                                            {series.addedBy?.followers?.length} Followers
                                        </h5>
                                        <Link
                                            to={`/add-profile-info/${id}`}
                                            className="items-center px-5 py-1.5 rounded-sm button text-white bg-blue-700"
                                        >
                                            Edit Profile
                                        </Link>
                                    </div>
                                ) : (
                                    <div className='flex flex-col items-center justify-center'>
                                        <Link to={`/user/${addedById}`}>
                                            <h3 className="font-medium text-gray-900 text-xl mb-1">
                                                {series.addedBy?.username || series.addedBy}
                                            </h3>
                                        </Link>
                                        <h5 className="font-small text-gray-500 text-lg mb-2">
                                            Followers : {series.addedBy?.followers?.length}
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

                        {similarSeries?.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6 gap-4">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    Similar Series based on Tags
                                </h2>
                                <div className="space-y-7.5">
                                    {similarSeries?.map((srs) => (
                                        <Link key={srs._id} to={`/series/${srs._id}`} className="flex gap-10 justify-start lg:gap-4">
                                            <img src={srs.coverImage} alt={srs.seriesName} className="w-35 h-20 rounded-lg object-cover" />
                                            <div>
                                                <p className="text-sm font-medium">{srs.seriesName}</p>
                                                <p className="text-xs text-gray-500">{srs.category?.category}</p>
                                                <div className='flex flex-wrap gap-1.5 mb-3 py-2'>
                                                    {srs.tags?.slice(0, 3).map((tag, index) => (
                                                        <span
                                                            key={tag + index}
                                                            className='bg-blue-600 text-white px-2 py-1 rounded-sm text-xs'
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

                        {sameAuthorSeries?.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6 gap-4">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    More by {series.addedBy?.username || series.addedBy}
                                </h2>
                                <div className="space-y-7.5">
                                    {sameAuthorSeries?.map((srs) => (
                                        <Link key={srs._id} to={`/series/${srs._id}`} className="flex gap-10 justify-start lg:gap-4">
                                            <img src={srs.coverImage} alt={srs.seriesName} className="w-35 h-20 rounded-lg object-cover" />
                                            <div>
                                                <p className="text-sm font-medium">{srs.seriesName}</p>
                                                <p className="text-xs text-gray-500">{srs.category?.category}</p>
                                                <div className='flex flex-wrap gap-1.5 mb-3 py-2'>
                                                    {srs.tags?.slice(0, 3).map((tag, index) => (
                                                        <span
                                                            key={tag + index}
                                                            className='bg-blue-600 text-white px-2 py-1 rounded-sm text-xs'
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
            </div>
        </div>
    );
};

export default SeriesPage;
