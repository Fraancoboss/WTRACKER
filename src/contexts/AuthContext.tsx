import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario } from '../types';
import { getUserPasswordById, upsertSystemUser } from '../lib/systemUsers';

interface AuthContextType {
    user: Usuario | null;
    accessToken: string | null;
    login: (nombre: string, password: string) => Promise<void>;
    logout: () => void;
    updateProfile: (updates: { nombre?: string; password?: string }) => Promise<void>;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Usuario | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(
        localStorage.getItem('accessToken')
    );
    const [loading, setLoading] = useState(true);

    // Base URL from environment or default
    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');

    useEffect(() => {
        // Check if we have a token and try to restore session
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const response = await fetch(`${API_BASE_URL}/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            setUser(data.data);
                        } else {
                            logout();
                        }
                    } else {
                        // Token invalid or expired
                        logout();
                    }
                } catch (error) {
                    console.error('Error restoring session:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (nombre: string, password: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al iniciar sesión');
        }

        if (data.success) {
            setUser(data.data.user);
            setAccessToken(data.data.accessToken);
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            upsertSystemUser({
                id: String(data.data.user.id),
                nombre: data.data.user.nombre,
                rol: data.data.user.rol,
                password,
            });
        }
    };

    const logout = () => {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    };

    const updateProfile = async ({ nombre, password }: { nombre?: string; password?: string }) => {
        setUser((prev) => {
            if (!prev) return prev;
            const updated = {
                ...prev,
                ...(nombre ? { nombre } : {}),
            };

            const finalPassword = password ?? getUserPasswordById(String(prev.id)) ?? '';
            upsertSystemUser({
                id: String(prev.id),
                nombre: nombre ?? prev.nombre,
                rol: prev.rol,
                password: finalPassword,
            });

            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{
            user,
            accessToken,
            login,
            logout,
            updateProfile,
            isAuthenticated: !!user,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
