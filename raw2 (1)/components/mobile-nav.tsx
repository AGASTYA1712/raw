"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface MobileNavProps {
  currentPage?: string
}

export default function MobileNav({ currentPage }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("citycare_loggedIn")
    router.push("/auth")
  }

  const navItems = [
    { label: "Home", path: "/" },
    { label: "All Complaints", path: "/complaints" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Report Issue", path: "/report" },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
        aria-label="Toggle menu"
      >
        <span className={`w-6 h-0.5 bg-blue-500 transition-all ${isOpen ? "rotate-45 translate-y-1.5" : ""}`} />
        <span className={`w-6 h-0.5 bg-blue-500 transition-all ${isOpen ? "opacity-0" : ""}`} />
        <span className={`w-6 h-0.5 bg-blue-500 transition-all ${isOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
      </button>

      {/* Desktop navigation */}
      <nav className="hidden md:flex gap-4">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`text-blue-500 hover:text-blue-700 transition-colors ${
              currentPage === item.path ? "font-semibold" : ""
            }`}
          >
            {item.label}
          </button>
        ))}
        <button onClick={handleLogout} className="text-blue-500 hover:text-blue-700 transition-colors">
          Logout
        </button>
      </nav>

      {/* Mobile navigation overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)}>
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-blue-500">Menu</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <nav className="space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path)
                    setIsOpen(false)
                  }}
                  className={`block w-full text-left py-2 px-4 rounded-lg transition-colors ${
                    currentPage === item.path
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => {
                  handleLogout()
                  setIsOpen(false)
                }}
                className="block w-full text-left py-2 px-4 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
