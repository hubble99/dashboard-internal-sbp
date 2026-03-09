import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isSuperAdmin: boolean;
    isAdmin: boolean;        // true untuk SUPER_ADMIN dan ADMIN
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password });
        const { token: newToken, user: newUser } = res.data.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, []);

    const updateUser = useCallback((updatedUser: Partial<User>) => {
        if (user) {
            const merged = { ...user, ...updatedUser };
            setUser(merged);
            localStorage.setItem('user', JSON.stringify(merged));
        }
    }, [user]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                isSuperAdmin: user?.role === 'SUPER_ADMIN',
                isAdmin: user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN',
                login,
                logout,
                loading,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// ProtectedRoute — untuk semua user yang sudah login
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading) return null;
    if (!isAuthenticated) return null;

    return <>{children}</>;
};

// SuperAdminRoute — hanya untuk SUPER_ADMIN
export const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isSuperAdmin, loading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                navigate('/login', { replace: true });
            } else if (!isSuperAdmin) {
                navigate('/penyelamatan-pangan', { replace: true });
            }
        }
    }, [isSuperAdmin, loading, isAuthenticated, navigate]);

    if (loading) return null;
    if (!isAuthenticated || !isSuperAdmin) return null;

    return <>{children}</>;
};
