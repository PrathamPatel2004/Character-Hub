import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../Contexts/AuthContext';
import CharacterCard from '../Components/CharacterCard';
import SeriesCard from '../Components/SeriesCard';
import EmptyData from '/EmptyData.png'
import toast from 'react-hot-toast';
import NoImageFound from '/NoImageFound.svg'
import useFollowUser from '../Hooks/useFollow';
import { useParams } from 'react-router-dom';

const UserProfile = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isCurrentUser, setIsCurrentUser] = useState(false);
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState('characters');
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/get-user-info/${id}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                       'Authorization': 'Bearer YOUR_ACCESS_TOKEN_HERE'
                    }
                });

                const data = await res.json();
                const userObj = Array.isArray(data.user) ? data.user[0] : data.user;
                setUserData(userObj);
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setTimeout(() => {
                    setLoadingData(false);
                }, 300);
            }
        };

        fetchUserData();
        setActiveTab('characters');
    }, [id]);

    const { isFollowing, toggleFollow, loading } = useFollowUser(id || '');

    const handleToggleFollow = async () => {
        setLoadingData(true);
        if (!user) {
            toast.error('You must be logged in to follow users!');
            return setLoadingData(false);
        }
    
        const success = await toggleFollow();
    
            if (success) {
                setUserData((prev) => {
                    if (!prev) return prev;

                    let updatedFollowers = [...(prev.followers || [])];
                    
                    if (isFollowing) {
                        updatedFollowers = updatedFollowers.filter((f) => f._id !== user._id);
                    } else {    
                        updatedFollowers.push({ _id: user._id, username: user.username, profilePic: user.profilePic });
                    }
                    return { ...prev, followers : updatedFollowers };
                });
                setTimeout(() => {
                  setLoadingData(false);  
                }, 300);
            }
        }

    useEffect(() => {
        if (user?._id === id) {
            setIsCurrentUser(true);
        } else {
            setIsCurrentUser(false);
        }
    }, [user, id]);

    if (loadingData) {
        return (
            <div className='flex items-center justify-center min-h-[100dvh]'>
                <p className="text-gray-500 text-lg">Loading user data...</p>
            </div>
        )
    }
    
    if (!userData) {
        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-4">
                <div className="flex flex-col items-center justify-center gap-4">
                    <img src={NoImageFound} alt="Not Found" className="w-32 h-32 object-cover" />
                    <p className="text-gray-600 mb-6">User Not Found.</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
                    <p className="text-gray-600 mb-6">You need to be logged in to add a character.</p>
                    <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">Go to Login</button>
                </div>
            </div>
        );
    }

    const userCharacters = userData?.charactersAdd || [];
    const userSeries = userData?.seriesAdd || [];
    const followers = userData?.followers || [];
    const following = userData?.following || [];

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                    <div className="px-8 pb-8">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6 -mt-16 justify-center items-center">
                            <img
                                src={userData?.profilePic || "/default-avatar.png"}
                                alt={userData?.username || "User"}
                                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                            />

                            <div className="flex-1">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:mt-16">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">{userData?.username}</h1>        
                                    </div>

                                    <div>
                                        {isCurrentUser ? (
                                            <div className="flex gap-3 items-center justify-center">
                                                <Link
                                                    to="/change-password"
                                                    className="flex items-center gap-2 border bg-green-200 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    <LockIcon className="h-4 w-4" />
                                                    Change Password
                                                </Link>
                                                <Link
                                                    to={`/add-profile-info/${id}`}
                                                    className="flex items-center gap-2 border bg-green-200 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    <EditIcon className="h-4 w-4" />
                                                    Edit Profile
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="flex gap-3 items-center justify-center">
                                                <button
                                                    onClick={handleToggleFollow}
                                                    disabled={loading}
                                                    className={`flex items-center gap-2 px-6 py-3 rounded-md transition-colors ${
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
                            </div>
                        </div>
                        <p className="text-gray-600 mt-4 flex lg:w-1/2 lg:justify-start lg:items-start justify-center items-center px-6">{userData?.bio}</p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-200">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900 mb-1">{userCharacters.length}</div>
                                <div className="text-gray-600 text-sm">Characters Added</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900 mb-1">{userSeries.length}</div>
                                <div className="text-gray-600 text-sm">Series Added</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900 mb-1">{userData?.followers?.length}</div>
                                <div className="text-gray-600 text-sm">Followers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900 mb-1">{userData?.following?.length}</div>
                                <div className="text-gray-600 text-sm">Following</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <nav className="flex space-x-8">
                        <NavLink
                            onClick={() => setActiveTab('characters')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'characters'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Characters Added ({userCharacters.length})
                        </NavLink>
                        <NavLink
                            onClick={() => setActiveTab('series')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'series'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Series Added ({userSeries.length})
                        </NavLink>
                        <NavLink
                            onClick={() => setActiveTab('followers')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'followers'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Followers ({userData?.followers?.length})
                        </NavLink>
                        <NavLink
                            onClick={() => setActiveTab('following')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'following'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Following ({userData?.following?.length})
                        </NavLink>   
                    </nav>
                </div>

                {activeTab === 'characters' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Characters</h2>
                            {isCurrentUser && (
                                <Link
                                    to="/add-character"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <AddIcon className="h-4 w-4" />
                                    Add New Character
                                </Link>
                            )}
                        </div>
                
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {userCharacters.map((character) => (
                                <CharacterCard key={character._id || character.id} character={character} />
                            ))}
                        </div>
                    
                        {userCharacters.length === 0 && (
                            <div className='flex flex-col justify-center items-center py-8'>
                                <img
                                    src={EmptyData}
                                    alt='No Characters Added'
                                    className='w-48 h-48'
                                />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No characters added yet</h3>
                                <p className="text-gray-600 mb-6">Added your first character data!</p>
                                <Link
                                    to="/add-character"
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                                >
                                    <AddIcon className="h-5 w-5" />
                                    Add Your First Character
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'series' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Series</h2>
                            {isCurrentUser && (
                                <Link
                                    to="/add-series"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <AddIcon className="h-4 w-4" />
                                    Add New Series
                                </Link>
                            )}
                        </div>
                
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {userSeries.map((series) => (
                                <SeriesCard key={series._id} series={series} />
                            ))}
                        </div>
                    
                        {userSeries.length === 0 && (
                            <div className='flex flex-col justify-center items-center py-8'>
                                <img
                                    src={EmptyData}
                                    alt='No Series Added'
                                    className='w-48 h-48'
                                />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No series added yet</h3>
                                <p className="text-gray-600 mb-6">Added your first series data!</p>
                                <Link
                                    to="/add-series"
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                                >
                                    <AddIcon className="h-5 w-5" />
                                    Add Your First Series
                                </Link>
                            </div>
                        )}
                  </div>
                )}

                {activeTab === 'followers' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Followers</h2>
                        </div>
                    
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {userData.followers?.map((user) => (
                                <Link
                                    key={user._id}
                                    to={`/user/${user._id}`}
                                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-6 hover:from-blue-100 hover:to-purple-100 transition-all duration-300"
                                >
                                    <div className='grid grid-rows-1 flex justify-center items-center gap-3 hover:scale-105 transition-all'>
                                        <img 
                                            src={user.profilePic}
                                            alt={user.username}
                                            className='w-30 h-30 items-center border rounded-full'
                                        />
                                        <h3 className="font-bold text-gray-900 mb-2">{user.username}</h3>
                                        <div className="absolute inset-0" />
                                    </div>
                                </Link>   
                            ))}
                        </div>
                        
                        {userData.followers?.length === 0 && (
                            <div className='flex flex-col justify-center items-center py-8'>
                                <img
                                    src={EmptyData}
                                    alt='No Followers'
                                    className='w-48 h-48'
                                />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No followers yet</h3>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'following' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Followings</h2>
                        </div>
                    
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {userData.following?.map((user) => (
                                <Link
                                    key={user._id}
                                    to={`/user/${user._id}`}
                                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-6 hover:from-blue-100 hover:to-purple-100 transition-all duration-300"
                                >
                                    <div className='grid grid-rows-1 flex justify-center items-center gap-3 hover:scale-105 transition-all'>
                                        <img 
                                            src={user.profilePic}
                                            alt={user.username}
                                            className='w-30 h-30 items-center border rounded-full'
                                        />
                                        <h3 className="font-bold text-gray-900 mb-2">{user.username}</h3>
                                        <div className="absolute inset-0" />
                                    </div>
                                </Link>   
                            ))}
                        </div>
                        
                        {userData.following?.length === 0 && (
                            <div className='flex flex-col justify-center items-center py-8'>
                                <img
                                    src={EmptyData}
                                    alt='No Followings'
                                    className='w-48 h-48'
                                />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No followings yet</h3>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;