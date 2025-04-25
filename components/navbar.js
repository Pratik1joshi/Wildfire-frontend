"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import AdminDropdown from "./admin-dropdown"
import UserDropdown from "./user-dropdown"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAdmin, isAuthenticated } = useAuth()
  const router = useRouter()
  
  // Force authentication redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated() && typeof window !== 'undefined') {
      router.push('/login');
    }
  }, [isAuthenticated, router])

  const handleNavClick = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-9999">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-['Pacifico'] text-primary">
            LiveFire
          </Link>
        </div>
        <div
          className={`md:flex space-x-8 ${isMenuOpen ? "block absolute top-16 left-0 right-0 bg-white p-4 shadow-md z-50" : "hidden"}`}
        >
          <Link
            href="/"
            className="text-gray-800 hover:text-primary font-medium block md:inline-block py-2 md:py-0 transition-colors duration-300"
            onClick={handleNavClick}
          >
            Home
          </Link>
          <Link
            href="/#alerts"
            className="text-gray-800 hover:text-primary font-medium block md:inline-block py-2 md:py-0 transition-colors duration-300"
            onClick={handleNavClick}
          >
            Alerts
          </Link>
          <Link
            href="/#compare"
            className="text-gray-800 hover:text-primary font-medium block md:inline-block py-2 md:py-0 transition-colors duration-300"
            onClick={handleNavClick}
          >
            Compare Maps
          </Link>
          <Link
            href="/about"
            className="text-gray-800 hover:text-primary font-medium block md:inline-block py-2 md:py-0 transition-colors duration-300"
            onClick={handleNavClick}
          >
            About
          </Link>

          {isAdmin() && (
            <Link
              href="/admin/dashboard"
              className="text-gray-800 hover:text-primary font-medium block md:inline-block py-2 md:py-0 transition-colors duration-300"
              onClick={handleNavClick}
            >
              Admin
            </Link>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated() ? (
            isAdmin() ? <AdminDropdown /> : <UserDropdown />
          ) : (
            <div className="flex space-x-2">
              <Link href="/login">
                <button className="bg-gray-100 text-gray-800 px-4 py-2 rounded-button whitespace-nowrap hover:bg-gray-200 transition">
                  Sign In
                </button>
              </Link>
              <Link href="/signup">
                <button className="bg-blue-500 cursor-pointer text-white px-4 py-2 rounded-button whitespace-nowrap hover:bg-blue-600 transition">
                  Sign Up
                </button>
              </Link>
            </div>
          )}
          <div
            className="md:hidden w-8 h-8 flex items-center justify-center cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`ri-${isMenuOpen ? "close" : "menu"}-line ri-lg`}></i>
          </div>
        </div>
      </div>
    </nav>
  )
}

