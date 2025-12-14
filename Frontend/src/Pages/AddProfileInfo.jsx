import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import toast from 'react-hot-toast';
import EditIcon from '@mui/icons-material/Edit';
import CropModal from '../Components/CropModel';
import Sad from '/Sad.webp';
import { useAuth } from '../Contexts/AuthContext';

const AddProfileInfo = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const [imageSrc, setImageSrc] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        avatar: '',
        bio: ''
    });

    useEffect(() => {
        if (!user) return;

        if (user._id !== id) {
            toast.error('You are not authorized to access this page.');
            navigate('/');
        }
    }, [user, id, navigate]);

    const { avatar, bio } = formData;

    useEffect(() => {
        if (!id) return;
        const fetchProfileInfo = async () => {
            try {
                const res = await fetch(`/api/auth/get-user-info/${id}`, {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'Failed to load profile info');
                }

                const currentUser = data.user;
                setFormData({
                    avatar : currentUser.profilePic || '',
                    bio : currentUser.bio || ''
                });

            } catch (err) {
                console.error(err);
                toast.error('Could not load profile info.');
            }
        };

        fetchProfileInfo();
    }, [id]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result);
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
        } else {
            toast.error('Please select a valid image.');
        }
    };

    const dataURLtoFile = (dataUrl, filename) => {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: mime });
    };

    const handleCroppedImage = (croppedImage) => {
        setFormData({ ...formData, avatar: croppedImage });
        setShowCropModal(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

        const uploadToCloud = async (file, single = true) => {
        const formData = new FormData();
        console.log('User in AddCharacter:', user);
        if (single) {
            formData.append('singleImage', file);
            const res = await fetch(`/api/upload/uploadFile`, { method : 'POST', body : formData, credentials : 'include' });
            const data = await res.json()
            return data?.data?.secure_url;
        } else {
            file.forEach(f => formData.append('MultipleImages', f));
            const res = await fetch(`/api/upload/uploadFiles`, { method : 'POST', body : formData, credentials : 'include' });
            const data = await res.json();
            return data?.data?.map(d => d.secure_url);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();

            if (avatar && avatar.startsWith('data:image')) {
                const avatarFile = dataURLtoFile(avatar, "avatar.jpg");
                formDataToSend.append("image", avatarFile);
            }

            formDataToSend.append("bio", bio);

            const res = await fetch(`/api/auth/add-profile-info`, {
                method: 'PUT',
                credentials: 'include',
                body: formDataToSend
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            toast.success('Profile info updated successfully!');
            navigate(`/user/${id}`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-[url('/bg.jpg')] bg-cover bg-center rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Add or Edit Profile Info</h2>
                        <p className="text-gray-600 mt-2">Add profile image and bio to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <img
                                    src={avatar || Sad}
                                    alt="Avatar Preview"
                                    className="w-32 h-32 rounded-full object-cover border shadow-md"
                                />

                                <label
                                    htmlFor="avatarInput"
                                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg"
                                    title="Change avatar"
                                >
                                    <EditIcon />
                                </label>

                                <input
                                    id="avatarInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                                Bio
                            </label>
                            <div className="relative">
                                <input
                                    id="bio"
                                    name="bio"
                                    type="text"
                                    value={bio}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Enter your bio"
                                />
                                <AccountCircleIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-600" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? 'Saving Info...' : 'Save Info'}
                        </button>
                    </form>

                    {showCropModal && (
                        <CropModal
                            imageSrc={imageSrc}
                            cropShape="round"
                            onCropDone={handleCroppedImage}
                            onCancel={() => setShowCropModal(false)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddProfileInfo;
