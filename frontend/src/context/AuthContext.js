import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('haven_token'));

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem('haven_token');
            const savedUser = localStorage.getItem('haven_user');
            
            if (savedToken && savedUser) {
                try {
                    setToken(savedToken);
                    const response = await authAPI.getMe();
                    setUser(response.data);
                    localStorage.setItem('haven_user', JSON.stringify(response.data));
                } catch (error) {
                    console.error('Auth init failed:', error);
                    logout();
                }
            }
            setLoading(false);
        };
        
        initAuth();
    }, []);

    const login = async (email, password) => {
        const response = await authAPI.login(email, password);
        const { token: newToken, user: userData } = response.data;
        
        localStorage.setItem('haven_token', newToken);
        localStorage.setItem('haven_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        
        return userData;
    };

    const register = async (data) => {
        const response = await authAPI.register(data);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('haven_token');
        localStorage.removeItem('haven_user');
        setToken(null);
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('haven_user', JSON.stringify(userData));
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
