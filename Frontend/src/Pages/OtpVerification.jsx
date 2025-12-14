import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ShieldIcon from '@mui/icons-material/Shield';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import toast from 'react-hot-toast';

const OTPVerification = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(30);
    const inputRefs = useRef([]);
    const email = location.state?.email || 'your email';

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        if (value.length > 1) {
            const chars = value.slice(0, 6).split('');
            for (let i = 0; i < chars.length && index + i < 6; i++) {
                newOtp[index + i] = chars[i];
            }
            setOtp(newOtp);
            inputRefs.current[Math.min(index + chars.length, 5)]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            toast.error('Please enter the complete 6-digit code');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`/api/auth/verify-OTP`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpCode }),
                credentials: "include"
            });

            let data;
            try {
                data = await res.json();
            } catch {
                throw new Error('Server error. Please try again later.');
            }

            if (!res.ok) {
                throw new Error(data.message || 'Verification failed');
            }

            toast.success('Email verified successfully!');
            navigate('/login');
        } catch (error) {
            toast.error(error.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        setResendLoading(true);

        try {
            const res = await fetch(`/api/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
                credentials: "include"
            });
            let data;
            try {
                data = await res.json();
            } catch {
                throw new Error('Server error. Please try again later.');
            }
          
            if (!res.ok) {
                throw new Error(data.message || 'Failed to resend OTP');
            }

            toast.success('New verification code sent!');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            setTimer(30);
        } catch (error) {
            toast.error('Failed to resend code. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-[url('/bg.jpg')] bg-cover bg-center rounded-2xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
                        <p className="text-gray-600 mt-2">
                            Enter the 6-digit code sent to
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex justify-center space-x-3">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-12 text-center text-xl font-bold border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    maxLength="1"
                                    inputMode="numeric"
                                    pattern="\d{1}"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.join('').length !== 6}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-blue-600 mb-4">Didn't receive the code?</p>
                        {timer > 0 ? (
                            <p className="text-sm text-gray-500">Resend code in {timer} seconds</p>
                        ) : (
                            <button
                                onClick={handleResend}
                                disabled={resendLoading}
                                className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                            >
                                {resendLoading ? 'Sending...' : 'Resend Code'}
                            </button>
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/signup')}
                            className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-700 font-medium mx-auto"
                        >
                            <KeyboardBackspaceIcon className="h-4 w-4 mt-1" />
                            Back to Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPVerification;
