import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem('auth : user');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);
    const API = import.meta.env.VITE_API_BASE_URL

    useEffect(() => {
        const verifySession = async () => {
            try {
                const res = await fetch(`${API}/api/auth/verify-access-token`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (res.ok) {
                    const data = await res.json();

                    setUser(prev => prev || { _id: data.userId });
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error('Session verification failed:', err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, []);

    useEffect(() => {
        try {
            if (user) {
                localStorage.setItem('auth : user', JSON.stringify(user));
            } else {
                localStorage.removeItem('auth : user');
            }
        } catch {}
    }, [user]);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            await fetch(`${API}/api/auth/logout`, {
                method: 'GET',
                credentials: 'include',
            });
        } catch {}
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout   }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;