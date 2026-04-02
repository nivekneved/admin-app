import React from 'react';

// Authentication has been removed as per guest-only requirement
// This component now acts as a pass-through
const ProtectedRoute = ({ children }) => {
    return children;
};

export default ProtectedRoute;
