import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import toast from 'react-hot-toast';
import CropModal from '../Components/CropModel';
import { useAuth } from '../Contexts/AuthContext';
import NoImageFound from '/NoImageFound.svg'

const AddSeries = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ seriesName : '', genre : '', category : '', categoryName : '', status : '', originalLanguage : '', availableIn : '', tags : [], coverImage : '', productionStudio : '', publication : '', createdBy : '', Author : '', imageGallery : [], description : '' });
    const [coverImage, setCoverImage] = useState(NoImageFound);
    const [newTag, setNewTag] = useState('');
    const [categoriesList, setCategoriesList] = useState([]);
    const [showCropModal, setShowCropModal] = useState(false);
    const [imageGallery, setImageGallery] = useState([]); 
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories/all-categories`, { method : 'GET' , credentials : 'include' });
                const data = await res.json();
                setCategoriesList(data.categories);
            } catch (err) {
                toast.error('Failed to load categories', err);
                console.error('Failed to load categories', err);
            }
        };
        fetchCategories();

        return () => {
            imageGallery.forEach(img => URL.revokeObjectURL(img.preview));
        };
    }, [imageGallery]);
    
    const handleInputChange = e => {
    const { name, value } = e.target;

    console.log(`Changed field: ${name}, Value: ${value}`);

    if (name === "category") {
        const selectedCategory = categoriesList.find(cat => cat._id === value);
        setFormData(prev => ({
            ...prev,
            category: value,
            categoryName: selectedCategory?.category || "",
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
};
    const handleImageChange = e => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setCoverImage(reader.result);
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
        } else {
            toast.error('Please select a valid image.');
        }
    };
    const dataURLtoFile = (dataurl, filename) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], filename, { type: mime });
    };

    const handleCroppedImage = croppedImage => {
        const file = dataURLtoFile(croppedImage, 'series.png');
        setFormData(prev => ({ ...prev, coverImage: file }));
        setCoverImage(croppedImage);
        setShowCropModal(false);
    };

    const handleCancelCrop = () => {
    setShowCropModal(false);
    setCoverImage(NoImageFound);   
    setFormData(prev => ({
        ...prev,
        coverImage: null,
    }));
};

    const removeGalleryItem = index => {
        const img = imageGallery[index];
        URL.revokeObjectURL(img.preview);
        const updated = imageGallery.filter((_, i) => i !== index);
        setImageGallery(updated);
        setFormData(prev => ({
            ...prev,
            imageGallery: updated.map(item => item.file),
        }));
    };

    const handleFileChange = (field, files) => {
        const processed = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        const updated = [...imageGallery, ...processed];
        setImageGallery(updated);
        setFormData(prev => ({
            ...prev,
            [field]: updated.map(f => f.file),
        }));
    };

    const addTag = () => {
        const tag = newTag.trim().toLowerCase();
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
            setNewTag('');
        }
    };

    const removeTag = tag => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag),
        }));
    };
    
    const uploadToCloud = async (file, single = true) => {
        const formData = new FormData();
        console.log('User in Add-Series :', user);
        if (single) {
            formData.append('singleImage', file);
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload/uploadFile`, { method: 'POST', body: formData, credentials: 'include' });
            const data = await res.json();
            return data?.data?.secure_url;
        } else {
            file.forEach(f => formData.append('MultipleImages', f));
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload/uploadFiles`, { method: 'POST', body: formData, credentials: 'include' });
            const json = await res.json();

            const urls = json?.data?.filter(u => u.success).map(u => u.data.secure_url);
            return urls || [];
        }
    };
    const handleSubmit = async e => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to continue');
            return;
        }

        setLoading(true);
        
        try {
            const coverImageUrl = await uploadToCloud(formData.coverImage, true);
            const galleryUrls = await uploadToCloud(formData.imageGallery, false);
            const payload = { ...formData, coverImage: coverImageUrl, imageGallery: galleryUrls };


            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/series/add-series`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Something went wrong');
            toast.success('Series added successfully');
            navigate('/');

        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
                    <p className="text-gray-600 mb-6">You need to be logged in to add a new Series.</p>
                    <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">Go to Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white-900 rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                        <h1 className="text-3xl font-bold text-white">Add New Series</h1>
                        <p className="text-blue-100 mt-2">Share your favorite Series or Movies with the community</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                {coverImage && (
                                    <img
                                        src={coverImage}
                                        alt="Cover Image Preview"
                                        className="aspect-[5/2] w-full h-full min-h-50 max-h-75 object-contain border rounded-lg shadow-md"
                                    />
                                )}
                                <label htmlFor="coverImageInput" className="absolute bottom-0 right-0 bg-transparent p-2 rounded-full cursor-pointer shadow-lg" title="Select Series Cover Image" >
                                    <EditIcon className='text-blue-500' />
                                </label>
                                <input id="coverImageInput" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Series Name *</label>
                                <input type="text" name="seriesName" required value={formData.seriesName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter series name" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Series Category *</label>
                                <select
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="" disabled>
                                        Select Category
                                    </option>
                                    
                                    {categoriesList?.map((category) => (
                                        <option key={category._id} value={category._id}>
                                        {category.category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Original Language *</label>
                                <input 
                                    type="text" 
                                    name="originalLanguage" 
                                    required value={formData.originalLanguage} 
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                    placeholder="Enter series Available in"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Available In *</label>
                                <input 
                                    type="text" 
                                    name="availableIn" 
                                    required value={formData.availableIn} 
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                    placeholder="Enter series Available in (eg: Hindi, English, etc.)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Series Genre *</label>
                                <input 
                                    type="text" 
                                    name="genre" 
                                    required value={formData.genre} 
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                    placeholder="Enter Series Genre (eg: Adventure, Action, Drama, etc.)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Series Status *</label>
                                <select
                                    name="status"
                                    required
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="" disabled>Select Status</option>
                                        <option value="Completed">Completed</option>
                                        <option value="OnGoing">OnGoing</option>
                                        <option value="UpComing">UpComing</option>
                                        <option value="Uncleared">Uncleared</option>
                                </select>
                            </div>
                        </div>

                        {["anime", "movies", "tv shows", "western animation"].includes(formData.categoryName?.toLowerCase()) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Production Studio Name
                                    </label>
                                    <input
                                        type="text"
                                        name="productionStudio"
                                        value={formData.productionStudio}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter Production Studio Name"
                                    />
                                </div>
                                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Created By
                                    </label>
                                    <input
                                        type="text"
                                        name="createdBy"
                                        value={formData.createdBy}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter Director/Producer Name"
                                    />
                                </div>
                            </div>
                        )}

                        {["books", "comics", "manga"].includes(formData.categoryName?.toLowerCase()) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Publication Name
                                    </label>
                                    <input
                                        type="text"
                                        name="publication"
                                        value={formData.publication}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter Publication  Name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Author Name
                                    </label>
                                    <input
                                        type="text"
                                        name="Author"
                                        value={formData.Author}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter Author Name"
                                    />
                                </div>
                            </div>
                        )}

                        {["original"].includes(formData.categoryName?.toLowerCase()) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Created By
                                    </label>
                                    <input
                                        type="text"
                                        name="createdBy"
                                        value={formData.createdBy}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter Publication  Name"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.tags.map((tag, index) => (
                                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-xl text-sm font-medium flex items-center gap-2">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="text-blue-600 hover:text-blue-800">
                                            <CloseIcon className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} className="flex-1 px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Add a tag" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}/>
                                <button type="button" onClick={addTag} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Add</button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Series Description *
                            </label>
                            <textarea
                                name="description"
                                required
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Describe the Series's Plot..."
                            />
                        </div>

                        <div className="row gap-6">
                            <div>
                                <div className="border-2 border-dashed border-gray-500 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                                    <label htmlFor="gallery-upload" className="block text-sm font-medium text-gray-700 mb-2">
                                        <FileUploadIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-600">Click to upload additional images</p>
                                        <p className="text-sm text-gray-500">You can select multiple images</p>
                                    </label>
                                        
                                    <input
                                        id="gallery-upload"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => handleFileChange('imageGallery', Array.from(e.target.files)) }
                                        className="hidden"
                                    />
                                </div>
                                {imageGallery?.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {imageGallery.map((fileObj, index) => {
                                            return (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={fileObj.preview}
                                                        alt={`preview-${index}`}
                                                        className="w-50 h-auto object-cover rounded-lg shadow"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeGalleryItem(index)}
                                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                    >
                                                        <CloseIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    )}
                                </div>
                            <div> 
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? 'Adding Series...' : 'Add Series'}
                        </button>
                    </div>
                </form>

                    {showCropModal && (
                        <CropModal
                            imageSrc={coverImage}
                            cropShape="rect"
                            aspectRatio={5 / 2}
                            onCropDone={handleCroppedImage}
                            onCancel={handleCancelCrop}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddSeries;
