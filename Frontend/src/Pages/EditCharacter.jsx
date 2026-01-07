import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from '../Contexts/AuthContext';
import toast from "react-hot-toast";
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import NoImageFound from '/NoImageFound.svg'
import CropModal from '../Components/CropModel';

const EditCharacter = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [character, setCharacter] = useState(null);
    const [characterImage, setCharacterImage] = useState(NoImageFound);
    const [formData, setFormData] = useState({ characterImage: "", description: "", tags: [], facts: [], achievements: [], powers: [] });
    const [newTag, setNewTag] = useState('');
    const [newPowers, setNewPowers] = useState('');
    const [showCropModal, setShowCropModal] = useState(false);
    const [galleryImages, setGalleryImages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/characters/character/${id}`,{ method: 'GET', credentials: 'include' });

                if (!res.ok) {
                    toast.error("Failed to fetch character");
                    return;
                }
                const data = await res.json();

                setCharacter(data.character);
                setFormData({
                    characterImage: data.character.characterImage,
                    description: data.character.description || "",
                    tags: data.character.tags || [],
                    facts: data.character.facts || [],
                    achievements: data.character.achievements || [],
                    powers: data.character.powers || [],
                });
            } catch (error) {
                console.error(error);
                toast.error("Failed to load data");
            }
        };

        fetchData();
    }, [id]);

    const handleArrayChange = (field, index, value) => {
        const updated = [...formData[field]];
        updated[index] = value;
        setFormData({ ...formData, [field]: updated });
    };

    const addPower = () => {
        const power = newPowers.trim().toLowerCase();
        if (power && !formData.powers.includes(power)) {
            setFormData(prev => ({ ...prev, powers : [...prev.powers, power] }));
            setNewPowers('');
        }
    };

    const removePower = (power) => {
        setFormData(prev => ({
            ...prev,
            powers: prev.powers.filter(p => p !== power)
        }));
    };

    const addTag = () => {
        const tag = newTag.trim().toLowerCase();
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({ ...prev, tags : [...prev.tags, tag] }));
            setNewTag('');
        }
    };

    const removeTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    const addArrayItem = field => {
        setFormData(prev => ({ ...prev, [field] : [...prev[field], ''] }));
    };
    
    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field] : prev[field].filter((_, i) => i !== index),
        }));
    };

    const removeGalleryItem = index => {
        const img = galleryImages[index];
        URL.revokeObjectURL(img.preview);
        const updated = galleryImages.filter((_, i) => i !== index);
        setGalleryImages(updated);
        setFormData(prev => ({
            ...prev,
            galleryImages : updated.map(item => item.file),
        }));
    };

    const handleImageChange = e => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setCharacterImage(reader.result);
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
        } else {
            toast.error('Please select a valid image.');
        }
    };

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name] : value }));
    };

    const handleFileChange = (field, files) => {
        const processed = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        const uniqueFiles = processed.filter(p =>
            p.file.name !== formData.characterImage?.name
        );

        const updated = [...galleryImages, ...uniqueFiles];
        setGalleryImages(updated);
        setFormData(prev => ({
            ...prev,
            [field]: updated.map(f => f.file),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            characterImage: formData.characterImage,
            description: formData.description,
            tags: formData.tags,
            facts: formData.facts,
            achievements: formData.achievements,
            powers: formData.powers,
        };

        try {
            const res = await fetch(
                `${API_BASE_URL}/api/character/edit/${id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(payload),
                }
            );
            if (!res.ok) {
                throw new Error("Update failed");
            }

            toast.success("Character updated");
            navigate(`/character/${id}`);
        } catch (error) {
            toast.error("Update failed");   
        } finally {
            setLoading(false);
        }
    };

    if (character && user && user._id !== character.addedBy?._id) {
        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Access Denied
                    </h2>
                    <p className="text-gray-600">
                        You do not have permission to edit this character.
                    </p>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen py-12">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white-900 rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                        <h1 className="text-3xl font-bold text-white">Edit Character</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8" disabled={loading}>
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">                
                                <img
                                    src={characterImage || character?.characterImage}
                                    alt="Cover Image Preview"
                                    className="w-50 h-50 object-contain border rounded-lg shadow-md"
                                />
                                <label htmlFor="characterImageInput" className="absolute bottom-0 right-0 bg-transparent p-2 rounded-full cursor-pointer shadow-lg" title="Select Character Image" >
                                    <EditIcon className='text-blue-500' />
                                </label>
                                <input id="characterImageInput" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Character Name</label>
                                <input type="text" name="name" value={character?.name} className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Series</label>
                                <select name="series" value={character?.series} className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled>
                                    <option disabled>{character?.series}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                <select name="gender" value={character?.gender} className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled>
                                    <option disabled>{character?.gender}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Species</label>
                                <input type="text" name="species" value={character?.species} className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                <input type="text" name="role" value={character?.role} className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled />
                            </div>
                                        
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
                                <input type="text" name="createdBy" value={character?.createdBy} className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Performed By</label>
                                <input type="text" name="performedBy" value={character?.performedBy} className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
                            <div className="relative">
                                <input type="text" name="origin" value={character?.origin} className="w-full px-4 py-3 pl-10 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled />
                                <LocationOnIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            </div>
                        </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Character Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" placeholder={character?.description}/>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Powers</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {formData.powers.map((power, index) => (
                                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                            {power}
                                            <button type="button" onClick={() => removePower(power)} className="text-blue-600 hover:text-blue-800">
                                                <CloseIcon className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" value={newPowers} onChange={(e) => setNewPowers(e.target.value)} className="flex-1 px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Add a Power" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}/>
                                        <button type="button" onClick={addPower} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Add</button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formData.tags.map((tag, index) => (
                                            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Interesting Facts</label>
                                    <div className="space-y-3">
                                        {formData.facts.map((fact, index) => (
                                            <div key={index} className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <input type="text" value={fact} onChange={(e) => handleArrayChange('facts', index, e.target.value)} className="w-full px-4 py-3 pl-10 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter an interesting fact"/>
                                                    <StarOutlineIcon className="absolute left-3 top-3.5 h-5 w-5 text-yellow-500" />
                                                </div>
                                                {formData.facts.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeArrayItem('facts', index)}
                                                        className="text-red-600 hover:text-red-800 p-3"
                                                    >
                                                        <CloseIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addArrayItem('facts')}
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            <AddIcon className="h-4 w-4" />
                                            Add another fact
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Achievements
                                    </label>
                                        <div className="space-y-3">
                                            {formData.achievements.map((achievement, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="text"
                                                            value={achievement}
                                                            onChange={(e) => handleArrayChange('achievements', index, e.target.value)}
                                                            className="w-full px-4 py-3 pl-10 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            placeholder="Enter an achievement"
                                                        />
                                                        <StarOutlineIcon className="absolute left-3 top-3.5 h-5 w-5 text-green-500" />
                                                    </div>
                                                    {formData.achievements.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeArrayItem('achievements', index)}
                                                            className="text-red-600 hover:text-red-800 p-3"
                                                        >
                                                            <CloseIcon className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        <button
                                            type="button"
                                            onClick={() => addArrayItem('achievements')}
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            <AddIcon className="h-4 w-4" />
                                            Add another achievement
                                        </button>
                                    </div>
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
                                                onChange={(e) => handleFileChange('galleryImages', Array.from(e.target.files)) }
                                                className="hidden"
                                            />
                                        </div>
                                        {galleryImages?.length > 0 && (
                                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                {galleryImages.map((fileObj, index) => {
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
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {loading ? 'Updating Character...' : 'Update Character'}
                            </button>
                        </div>
                    </form>

                    {showCropModal && (
                        <CropModal
                            imageSrc={characterImage}
                            cropShape="rect"
                            onCropDone={handleCroppedImage}
                            onCancel={handleCancelCrop}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditCharacter;
