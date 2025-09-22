"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import MobileNav from "../components/mobile-nav"

interface User {
  fname: string
  role: string
}

interface Complaint {
  id: string
  title: string
  desc: string
  category: string
  constituency: string
  location: string
  image: string | null
  contact: string
  status: string
  createdAt: string
  createdBy: string
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const loggedInUser = localStorage.getItem("citycare_loggedIn")
    if (!loggedInUser) {
      alert("You must be logged in to view this page.")
      router.push("/auth")
      return
    }

    const userData = JSON.parse(loggedInUser)
    setUser(userData)

    // Load complaints
    const storedComplaints = localStorage.getItem("citycare_complaints_v1")
    if (storedComplaints) {
      setComplaints(JSON.parse(storedComplaints))
    }

    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("citycare_loggedIn")
    router.push("/auth")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const totalComplaints = complaints.length
  const pendingComplaints = complaints.filter((c) => c.status === "Pending").length
  const resolvedComplaints = totalComplaints - pendingComplaints

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="fixed top-0 w-full bg-blue-50 shadow-md z-50 px-4 md:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="text-xl md:text-2xl font-semibold text-blue-500">CityCare</div>
          <MobileNav currentPage="/" />
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Greeting */}
        <div className="text-center mb-6">
          <div className="inline-block bg-blue-50 text-gray-700 px-4 py-2 rounded-lg text-base md:text-lg font-medium">
            Welcome, {user.fname}!
          </div>
        </div>

        {/* Main Section */}
        <div className="bg-white rounded-xl p-4 md:p-8 shadow-sm border-t-4 border-blue-200">
          {/* Statistics Badges */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
            <span className="px-3 md:px-4 py-2 bg-blue-50 text-blue-500 rounded-full text-xs md:text-sm border border-blue-200">
              Total: {totalComplaints}
            </span>
            <span className="px-3 md:px-4 py-2 bg-blue-50 text-blue-500 rounded-full text-xs md:text-sm border border-blue-200">
              Pending: {pendingComplaints}
            </span>
            <span className="px-3 md:px-4 py-2 bg-blue-50 text-blue-500 rounded-full text-xs md:text-sm border border-blue-200">
              Resolved: {resolvedComplaints}
            </span>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
            <button
              onClick={() => router.push("/report")}
              className="flex flex-col items-center p-4 md:p-6 bg-blue-25 rounded-lg shadow-sm border border-blue-100 hover:bg-blue-50 active:bg-blue-100 transition-all duration-300"
            >
              <span className="text-xl md:text-2xl mb-2 text-blue-500">📝</span>
              <h3 className="text-base md:text-lg text-gray-700">Report an Issue</h3>
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="flex flex-col items-center p-4 md:p-6 bg-blue-25 rounded-lg shadow-sm border border-blue-100 hover:bg-blue-50 active:bg-blue-100 transition-all duration-300"
            >
              <span className="text-xl md:text-2xl mb-2 text-blue-500">📊</span>
              <h3 className="text-base md:text-lg text-gray-700">View Dashboard</h3>
            </button>
          </div>

          {/* Today's New Section */}
          <div className="text-center p-4 md:p-6 bg-blue-25 rounded-lg shadow-sm border border-blue-100">
            <h3 className="text-lg md:text-xl text-gray-700 mb-2">Today's New</h3>
            <p className="text-gray-600 text-sm">Recent complaints and headlines will be shown here.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
