import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Invalid_or_expired from '/Invalid_or_expired.svg';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [isTokenValid, setIsTokenValid] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const validateToken = async () => {
            try {
                const res = await fetch(`/api/auth/validate-reset-token/${token}`);
                if (!res.ok) throw new Error('Invalid or expired token');
                setIsTokenValid(true);
            } catch (err) {
                toast.error('This reset link is invalid or has expired');
                setIsTokenValid(false);
            }
        };

        validateToken();
    }, [token]);

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 400) {
                    toast.error('Reset link is invalid or has expired');
                    navigate('/forgot-password');
                } else {
                    throw new Error(data.message || 'Failed to reset password');
                }
            }

            toast.success('Password reset successfully');
            navigate('/login');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-[url('/bg.jpg')] bg-cover bg-center rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LockIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Reset Your Password</h2>
                        <p className="text-gray-600 mt-2">Enter a new password below</p>
                    </div>

                    {isTokenValid === false ? (
                        <div className="text-center py-4">
                            <div className="mb-5 flex justify-center items-center">
                                <img
                                    src={Invalid_or_expired}
                                    alt="Not-Invalid_or_expired"
                                    className="w-[40%] h-auto"
                                />
                            </div>
                            <h3 className="text-xl font-medium text-red-600 mb-2">Password Reset Link is Invalid or Expired</h3>
                        </div>
                    ) : ( 
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
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
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    {confirmPassword && (
                                        <div className={`text-xs mt-2 ${
                                            newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'
                                        }`}>
                                            {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                        </div>
                                    )}
                                </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;

