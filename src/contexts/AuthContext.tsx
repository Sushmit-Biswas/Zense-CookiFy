import React, { createContext, useContext, useEffect, useState } from 'react';
import appwriteService from '../services/appwriteService';

interface User {
    $id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<any>;
    register: (email: string, password: string, name: string) => Promise<any>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const userData = await appwriteService.getCurrentUser();
            if (userData) {
                setUser(userData);
            }
        } catch (error) {
            console.log('No active session');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const session = await appwriteService.login(email, password);
            if (session) {
                const userData = await appwriteService.getCurrentUser();
                setUser(userData);
                return { success: true };
            }
        } catch (error: any) {
            throw new Error(error.message || 'Login failed');
        }
    };

    const register = async (email: string, password: string, name: string) => {
        try {
            const account = await appwriteService.createAccount(email, password, name);
            if (account) {
                const userData = await appwriteService.getCurrentUser();
                setUser(userData);
                return { success: true };
            }
        } catch (error: any) {
            throw new Error(error.message || 'Registration failed');
        }
    };

    const logout = async () => {
        try {
            await appwriteService.logout();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const value: AuthContextType = {
        user,
        login,
        register,
        logout,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
