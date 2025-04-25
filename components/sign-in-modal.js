"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import SignUpModal from "./sign-up-modal";

export default function SignInModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  
  const { signIn } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      onClose();
    } catch (error) {
      setError(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };
  
  const switchToSignUp = () => {
    setShowSignUp(true);
  };
  
  const switchToSignIn = () => {
    setShowSignUp(false);
  };

  if (!isOpen) return null;
  
  if (showSignUp) {
    return <SignUpModal isOpen={true} onClose={onClose} switchToSignIn={switchToSignIn} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <i className="ri-close-line ri-lg"></i>
        </button>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Sign In</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="your@email.com"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="********"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-primary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button 
                type="button"
                onClick={switchToSignUp} 
                className="text-primary hover:underline focus:outline-none"
              >
                Sign Up
              </button>
            </p>
          </div>
        </form>
        
        <div className="mt-6 border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500 text-center">
            Demo credentials: admin@example.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}

