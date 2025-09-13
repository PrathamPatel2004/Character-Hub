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
    const [loading, setLoading] = useState(false);

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
            await fetch('http://localhost:5000/api/auth/logout', {
                method : 'GET',
                credentials : 'include',
            });
        } catch {}
      setUser(null);
  };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;