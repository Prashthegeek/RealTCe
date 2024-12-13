import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user"); // Assuming user info is stored in localStorage as JSON

  // If a token exists and the user is authenticated, redirect to the main page
  if (token && user) {
    return <Navigate to="/main" replace />;
  }

  // If no token or user, allow access to the public route (e.g., login page)
  return children;
};

export default PublicRoute;
