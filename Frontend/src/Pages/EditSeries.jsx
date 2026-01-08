import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../Contexts/AuthContext';
import NoImageFound from '/NoImageFound.svg'
import CropModal from '../Components/CropModel';

const EditSeries = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [series, setSeries] = useState(null);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ status : '', availableIn : '', productionStudio : '', createdBy : '', publication : '', Author : '', tags : [], coverImage : '', imageGallery : [], description : '' });
    const [coverImage, setCoverImage] = useState(NoImageFound);
    const [newTag, setNewTag] = useState('');
    const [categoriesList, setCategoriesList] = useState([]);
    const [showCropModal, setShowCropModal] = useState(false);
    const [imageGallery, setImageGallery] = useState([]); 
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/series/${id}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!res.ok) {
                    toast.error("Failed to fetch series");
                    return;
                }

                const data = await res.json();
                const series = data.series;
                setSeries(series);

                setFormData({
                    availableIn: series.availableIn || "",
                    status: series.status || "",
                    productionStudio: series.productionStudio || "",
                    publication: series.publication || "",
                    createdBy: series.createdBy || "",
                    Author: series.Author || "",
                    tags: series.tags || [],
                    description: series.description || "",
                });

                setCoverImage(series.coverImage || user);

                if (Array.isArray(series.imageGallery)) {
                    setImageGallery(
                        series.imageGallery.map(url => ({
                            preview: url.startsWith("http://")
                                ? url.replace("http://", "https://")
                                : url,
                            isExisting: true,
                        }))
                    );
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load series");
            }
        };

        fetchData();
    }, [id]);


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
    
    const handleFileChange = (field, files) => {
        const processed = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setImageGallery(prev => [...prev, ...processed]);
    };

    const removeGalleryItem = (index) => {
        const img = imageGallery[index];
        if (!img.isExisting) {
            URL.revokeObjectURL(img.preview);
        }
        setImageGallery(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            availableIn: formData.availableIn,
            status: formData.status,
            productionStudio: formData.productionStudio,
            createdBy: formData.createdBy,
            publication: formData.publication,
            Author: formData.Author,
            tags: formData.tags,
            description: formData.description,
        };

        const res = await fetch(
            `/api/series/edit/${id}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            }
        );

        if (res.ok) {
            toast.success("Series updated");
            navigate(`/series/${id}`);
        } else {
            toast.error("Update failed");
        }
    };

    if (user._id !== series?.addedBy?._id) {
        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-6">You do not have permission to edit this series.</p>
                </div>
            </div>
        )   
    }

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white-900 rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                        <h1 className="text-3xl font-bold text-white">Update Series</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <img
                                    src={series.coverImage}
                                    alt="Cover Image Preview"
                                    className="aspect-[5/2] w-full h-full min-h-50 max-h-75 object-contain border rounded-lg shadow-md"
                                />
                                <label htmlFor="coverImageInput" className="absolute bottom-0 right-0 bg-transparent p-2 rounded-full cursor-pointer shadow-lg" title="Select Series Cover Image" >
                                    <EditIcon className='text-blue-500' />
                                </label>
                                <input id="coverImageInput" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Series Name</label>
                                <input type="text" name="seriesName" value={series.seriesName} className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter series name" disabled />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Series Category</label>
                                <select
                                    name="category"
                                    value={series.category}
                                    className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled
                                >
                                    <option value={series.category} disabled>
                                        {series.categoryName}
                                    </option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Original Language</label>
                                <input 
                                    type="text" 
                                    name="originalLanguage" 
                                    value={series.originalLanguage} 
                                    className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                    placeholder="Enter series Available in"
                                    disabled
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Available In</label>
                                <input 
                                    type="text" 
                                    name="availableIn" 
                                    value={formData.availableIn} 
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                    placeholder={series.availableIn ? series.availableIn : "Enter series Available in (eg: Hindi, English, etc.)"}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Series Genre</label>
                                <input 
                                    type="text" 
                                    name="genre" 
                                    value={series.genre} 
                                    className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                    placeholder="Enter Series Genre (eg: Adventure, Action, Drama, etc.)"
                                    disabled
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Series Status</label>
                                <select
                                    name="status"
                                    required
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value={series.status} disabled>
                                        {series.status}
                                    </option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="upcoming">Upcoming</option>
                                </select>
                            </div>
                        </div>

                        {["anime", "movies", "tv shows", "western animation"].includes(series.categoryName?.toLowerCase()) && (
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
                                        placeholder={series.productionStudio || "Enter Production Studio Name"}
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
                                        placeholder={series.createdBy || "Enter Director/Producer Name"}
                                    />
                                </div>
                            </div>
                        )}

                        {["books", "comics", "manga"].includes(series.categoryName?.toLowerCase()) && (
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
                                        placeholder={series.publication || "Enter Publication Name"}
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
                                        placeholder={series.Author || "Enter Author Name"}
                                    />
                                </div>
                            </div>
                        )}

                        {["original"].includes(series.categoryName?.toLowerCase()) && (
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
                                        placeholder={series.createdBy || "Enter Director/Producer Name" }
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
                                Series Description
                            </label>
                            <textarea
                                name="description"
                                required
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder={series?.description || "Enter Series Description"}
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
                            {loading ? 'Updating Series...' : 'Update Series'}
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

export default EditSeries;
