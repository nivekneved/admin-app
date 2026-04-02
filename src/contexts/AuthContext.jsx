import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext({
    user: null,
    isAdmin: false,
    loading: true,
    signIn: async () => ({ success: false }),
    signOut: async () => {},
    session: null
})

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('admin-session');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const signIn = async (username, password) => {
        if (username === 'admin' && password === 'travellounge2026') {
            const adminUser = { 
                id: 'admin-master', 
                email: 'admin@travellounge.mu', 
                user_metadata: { name: 'Master Admin' } 
            };
            sessionStorage.setItem('admin-session', JSON.stringify(adminUser));
            setUser(adminUser);
            return { success: true };
        } else {
            return { success: false, error: 'Invalid authentication credentials' };
        }
    };

    const signOut = async () => {
        sessionStorage.removeItem('admin-session');
        setUser(null);
    };

    const value = {
        user,
        session: user ? { user } : null,
        isAdmin: !!user,
        loading,
        signIn,
        signOut
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
