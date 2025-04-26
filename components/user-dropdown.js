"use client"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { user, signOut } = useAuth()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 bg-green-500 text-white px-4 py-2 rounded-button hover:bg-green-600 transition"
      >
        <span>{user?.full_name}</span>
        <i className={`ri-arrow-down-s-line transition-transform ${isOpen ? "rotate-180" : ""}`}></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user?.full_name || 'User'}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>

          <Link
            href="/"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <i className="ri-dashboard-line mr-2"></i>
            Dashboard
          </Link>

          <Link
            href="/#alerts"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <i className="ri-notification-line mr-2"></i>
            Alerts
          </Link>

          <button
            onClick={() => {
              signOut()
              setIsOpen(false)
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 border-t border-gray-100"
          >
            <i className="ri-logout-box-line mr-2"></i>
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
