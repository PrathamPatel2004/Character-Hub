import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext.jsx';
import logo from '/logo.svg';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import Sad from '/Sad.webp'
import toast from 'react-hot-toast';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [userProfilePic, setUserProfilePic] = useState(Sad);
    const { user, logout } = useAuth();
    const [serchOpen, setSearchOpen] = useState(false);
    const navigate = useNavigate();
    const API = import.meta.env.VITE_API_BASE_URL

    const id = user?._id

    useEffect(() => {
        const fetchProfileInfo = async () => {
            try {
                const res = await fetch(`${API}/api/auth/get-user-info/${id}`, {
                    method : 'GET',
                    credentials : 'include'
                });
                const data = await res.json();
                const currentUser = data.user;
                setUserProfilePic(currentUser?.profilePic);
            } catch (err) {
                console.error(err);
                toast.error('User not found, please login.');
            }
        };

        fetchProfileInfo();
    }, [user]);

    const handleSearchOpen =  () => {
        setSearchOpen(!serchOpen);
    }


    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSearch = async (e) => {
    e.preventDefault();

    try {
        const res = await fetch(`${API}/api/search/search-query?q=${encodeURIComponent(searchQuery)}`, {
            method: 'GET',
            credentials: 'include',
        });

        const data = await res.json();
        navigate('/search-results', { state: { results: data } });

    } catch (error) {
        console.error('Search failed:', error);
        toast.error('Search failed. Please try again.');
    }
};


    return (
        <nav className="bg-white/30 backdrop-blur-md border-b border-gray-300 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center hover:scale-115 transition-all">
                        <img src={logo} alt="logo" className="w-full" />
                    </Link>

                    <div className="hidden lg:flex items-center space-x-4">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
                        <Link to="/categories" className="text-gray-700 hover:text-blue-600 transition-colors">Categories</Link>
                        <Link to="/characters" className="text-gray-700 hover:text-blue-600 transition-colors">Characters</Link>
                        <Link to="/series" className="text-gray-700 hover:text-blue-600 transition-colors">Series</Link>
                    </div>

                    <div className="hidden lg:flex items-center space-x-4">
                        <button
                            onClick={handleSearchOpen}
                            className='flex items-center text-gray-700 hover:text-blue-600 transition-colors p-3 rounded-full hover:scale-120 transition-all'
                        >
                           <SearchIcon /> 
                        </button>
                        {user ? (
                            <>
                                <div className="relative group hover:scale-110 transition-all">
                                    <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
                                        <img 
                                            src={userProfilePic || Sad}
                                            className='w-12 h-12 rounded-full border border-gray-700'
                                        />
                                    </button>
                                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <ul className="list-none py-2">
                                            <li className="px-4 py-1 hover:bg-blue-200">
                                                <Link to="/categories" className="block px-4 py-2 text-gray-700 rounded-t-lg">Categories</Link>
                                            </li>
                                            <li className="px-4 py-1 hover:bg-blue-200">
                                                <Link to="/characters" className="block px-4 py-2 text-gray-700 rounded-t-lg">Characters</Link>
                                            </li>
                                            <li className="px-4 py-1 hover:bg-blue-200">
                                                <Link to="/series" className="block px-4 py-2 text-gray-700 rounded-t-lg">Series</Link>
                                            </li>
                                            <li className="px-4 py-1 hover:bg-blue-200">
                                                <Link to={`/user/${id}`} className="block px-4 py-2 text-gray-700 rounded-t-lg">Profile</Link>
                                            </li>
                                            <li className="px-4 py-1 hover:bg-blue-200">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex justify-center items-center px-4 py-2 text-gray-700 rounded-b-lg space-x-2 transition-colors"
                                                >
                                                    <LogoutIcon className="h-4 w-4" />
                                                    <span>Logout</span>
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="relative group hover:scale-110 transition-all">
                                    <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
                                        <img 
                                            src={Sad}
                                            className='w-12 h-12 rounded-full border border-gray-700'
                                        />
                                    </button>
                                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <ul className="list-none py-2">
                                            <li className="px-4 py-1 hover:bg-blue-200">
                                                <Link to="/login" className="block px-4 py-2 text-gray-700 rounded-t-lg">Login</Link>
                                            </li>
                                            <li className="px-4 py-1 hover:bg-blue-200">
                                                <Link to="/signup" className="block px-4 py-2 text-gray-700 rounded-t-lg">Sign Up</Link>
                                            </li>
                                            <li className="px-4 py-1 hover:bg-blue-200">
                                                <Link to="/forgot-password" className="block px-4 py-2 text-gray-700 rounded-t-lg">Forgot Password</Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden text-gray-700 hover:text-blue-600 transition-colors"
                    >
                        {isOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                    </button>
                </div>

                {isOpen && (
                    <div className="lg:hidden border-t border-gray-200 pt-4 pb-4">
                        <div className="flex flex-col space-y-4">
                            <form onSubmit={handleSearch} className="px-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-2 pl-10 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                </div>
                            </form>
                            <Link to="/categories" className="text-gray-700 hover:text-blue-600 transition-colors px-2">Categories</Link>
                            <Link to="/characters" className='text-gray-700 hover:text-blue-600 transition-colors px-2'>Characters</Link>
                            <Link to="/series" className="text-gray-700 hover:text-blue-600 transition-colors px-2">Series</Link>
                            {user ? (
                                <>
                                    <Link to={`/user/${id}`} className="text-gray-700 hover:text-blue-600 transition-colors px-2">Profile</Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex justify-center items-center px-4 py-2 text-gray-700 rounded-b-lg space-x-2 transition-colors"
                                    >
                                        <LogoutIcon className="h-4 w-4" />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors px-2">Login</Link>
                                    <Link to="/signup" className="text-gray-700 hover:text-blue-700 transition-colors px-2">Sign Up</Link>
                                    <Link to="/forgot-password" className="text-gray-700 hover:text-blue-700 transition-colors px-2">Forgot Password</Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {serchOpen === true && (
                <form onSubmit={handleSearch} className="px-6 hidden lg:block py-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 pl-10 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <div className="absolute right-5 top-0.5 flex space-x-5 text-gray-400">
                            <button
                                onClick={handleSearch}
                                className="h-4 w-4 p-2 hover:text-blue-600"
                            >
                                <SearchIcon/>
                            </button>
                            <button
                                onClick={handleSearchOpen}
                                className="h-4 w-4 p-2 hover:text-red-600"
                            >
                                <CloseIcon/>
                            </button>
                        </div>
                    </div>
                </form>                           
            )}
        </nav>
    );
};

export default Navbar;
