import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShieldIcon from '@mui/icons-material/Shield';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../Contexts/AuthContext';
import toast from 'react-hot-toast';

const ChangePassword = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const API = import.meta.env.VITE_API_BASE_URL;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

      const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API}/api/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to change password');
            }

            toast.success('Password changed successfully!');
            navigate(`/user/${user._id}`);
        } catch (error) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };;

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
                    <p className="text-gray-600 mb-6">You need to be logged in to change your password.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }
        
    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-[url('/bg.jpg')] bg-cover bg-center rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Change Password</h2>
                        <p className="text-gray-600 mt-2">Keep your account secure</p>
                    </div>
          
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type={showPasswords.current ? 'text' : 'password'}
                                    required
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Enter current password"
                                />
                                <LockIcon className="absolute left-3 top-3 h-5 w-5 text-gray-600" />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('current')}
                                    className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
                                >
                                    {showPasswords.current ? <VisibilityOffIcon className="h-5 w-5" /> : <VisibilityIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showPasswords.new ? 'text' : 'password'}
                                    required
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Enter new password"
                                />
                                <LockIcon className="absolute left-3 top-3 h-5 w-5 text-gray-600" />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('new')}
                                    className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
                                >
                                    {showPasswords.new ? <VisibilityOffIcon className="h-5 w-5" /> : <VisibilityIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Confirm new password"
                                />
                                <LockIcon className="absolute left-3 top-3 h-5 w-5 text-gray-600" />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
                                >
                                    {showPasswords.confirm ? <VisibilityOffIcon className="h-5 w-5" /> : <VisibilityIcon className="h-5 w-5" />}
                                </button>
                            </div>
                            {formData.confirmPassword && (
                                <div className={`text-xs mt-2 ${
                                    formData.newPassword === formData.confirmPassword ? 'text-green-600' : 'text-red-500'
                                }`}>
                                    {formData.newPassword === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                </div>
                            )}
                        </div>
                    
                        <button
                            type="submit"
                            disabled={loading || formData.newPassword !== formData.confirmPassword}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? 'Changing Password...' : 'Change Password'}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate(`/user/${user._id}`)}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            <KeyboardBackspaceIcon className="h-4 w-4" />Back to Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ChangePassword;
