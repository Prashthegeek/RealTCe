//before rendering a component (like main.jsx and Room.jsx, which can only be accessed if user is loggedin) , 
//so , used this in App.jsx 

import React from 'react';
import { Navigate } from 'react-router-dom';

// ProtectedRoute Component
const ProtectedRoute = ({ children }) => {  //wrapped component
  const isAuthenticated = localStorage.getItem('token'); // Or replace with your auth logic

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // Redirect to login page
  }

  return children; // Render the protected component
};

export default ProtectedRoute;
