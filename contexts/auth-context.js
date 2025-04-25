"use client";
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create the authentication context
const AuthContext = createContext();

// API endpoints
const API_BASE_URL = "https://livefire-api.onrender.com"; // Adjust this to your FastAPI server URL
const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  SIGNUP: `${API_BASE_URL}/auth/signup`,
};

// Local storage key for token
const TOKEN_STORAGE_KEY = "livefire_token";
const USER_STORAGE_KEY = "livefire_user";

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize user from local storage on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    }
  }, []);
  
  // Sign up a new user
  const signUp = async (email, password, fullName) => {
    try {
      console.log("Signing up with:", { email, fullName });
      
      const response = await axios.post(
        AUTH_ENDPOINTS.SIGNUP, 
        {
          email,
          password,
          full_name: fullName,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log("Signup response:", response.data);
      
      const { access_token, user: userData } = response.data;
      
      // Store token and user data
      localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Sign up error:", error);
      let errorMessage = "Sign up failed";
      
      if (error.response) {
        console.error("Error response:", error.response.data);
        errorMessage = error.response.data.detail || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
  };
  
  // Sign in
  const signIn = async (email, password) => {
    try {
      console.log("Signing in with:", email);
      
      // FastAPI OAuth2 expects username/password in form data
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await axios.post(
        AUTH_ENDPOINTS.LOGIN, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log("Login response:", response.data);
      
      const { access_token, user: userData } = response.data;
      
      // Store token and user data
      localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Invalid email or password";
      
      if (error.response) {
        console.error("Error response:", error.response.data);
        errorMessage = error.response.data.detail || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
  };
  
  // Sign out
  const signOut = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  };
  
  // Check if user is admin
  const isAdmin = () => {
    return user && user.role === "admin";
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };
  
  // Get auth token (for API requests)
  const getToken = () => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  };
  
  // Context value
  const value = {
    user,
    isLoading,
    signIn,
    signOut,
    signUp,
    isAdmin,
    isAuthenticated,
    getToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

