import React, { createContext, useContext, useEffect, useState } from 'react'

// Authentication has been removed as per guest-only requirement
const AuthContext = createContext({
    user: null,
    isAdmin: true,
    loading: false,
    signIn: async () => ({ success: true }),
    signOut: async () => {},
    session: null
})

export const AuthProvider = ({ children }) => {
    // Return a mocked environment where everyone is an admin by default without login
    const value = {
        user: { id: 'admin-guest', email: 'admin@travellounge.mu', user_metadata: { name: 'Admin Guest' } },
        session: { user: { id: 'admin-guest' } },
        isAdmin: true,
        loading: false,
        signIn: async () => ({ success: true }),
        signOut: async () => {}
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
