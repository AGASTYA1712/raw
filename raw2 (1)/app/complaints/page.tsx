"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import MobileNav from "../../components/mobile-nav"

interface Complaint {
  id: string
  category: string
  constituency: string
  status: string
  title: string
  description: string
  date: string
}

interface User {
  id: string
  fname: string
  lname: string
  email: string
  role: string
}

export default function Complaints() {
  const router = useRouter()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("citycare_loggedIn") || "null")
      setUser(loggedInUser)

      const STORAGE_COMPLAINTS = "citycare_complaints_v1"
      const storedComplaints = JSON.parse(localStorage.getItem(STORAGE_COMPLAINTS) || "[]")
      setComplaints(storedComplaints)
    } catch (err) {
      console.error("[v0] Error loading data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateComplaintStatus = async (complaintId: string, newStatus: string) => {
    if (!user || user.role !== "authority") return

    setUpdatingStatus(complaintId)
    try {
      const updatedComplaints = complaints.map((complaint) =>
        complaint.id === complaintId ? { ...complaint, status: newStatus } : complaint,
      )

      setComplaints(updatedComplaints)
      localStorage.setItem("citycare_complaints_v1", JSON.stringify(updatedComplaints))

      setTimeout(() => setUpdatingStatus(null), 1000)
    } catch (err) {
      console.error("[v0] Error updating complaint status:", err)
      setUpdatingStatus(null)
    }
  }

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesFilter = filter === "all" || complaint.status.toLowerCase() === filter.toLowerCase()
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.constituency.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e6f0fa] via-[#93c5fd] to-[#b3d4fc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f0fa] via-[#93c5fd] to-[#b3d4fc] text-[#1e293b] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-[#4facfe] mb-4 md:mb-6 tracking-wide">ALL COMPLAINTS</h1>

          {user?.role === "authority" && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm md:text-base">
              <span className="font-medium">Authority Access:</span> You can mark complaints as resolved or pending
            </div>
          )}

          {/* Navigation */}
          <div className="hidden md:flex justify-center gap-4 mb-8">
            <button
              onClick={() => router.push("/")}
              className="px-4 md:px-6 py-2 bg-transparent border border-[#b3d4fc] text-[#4facfe] rounded-lg hover:bg-[#e6f0fa] hover:text-[#2e8df7] transition-all"
            >
              Home
            </button>
            <button className="px-4 md:px-6 py-2 bg-[#4facfe] text-white rounded-lg">All Complaints</button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 md:px-6 py-2 bg-transparent border border-[#b3d4fc] text-[#4facfe] rounded-lg hover:bg-[#e6f0fa] hover:text-[#2e8df7] transition-all"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/report")}
              className="px-4 md:px-6 py-2 bg-transparent border border-[#b3d4fc] text-[#4facfe] rounded-lg hover:bg-[#e6f0fa] hover:text-[#2e8df7] transition-all"
            >
              Report Issue
            </button>
            <button
              onClick={() => router.push("/auth")}
              className="px-4 md:px-6 py-2 bg-transparent border border-[#b3d4fc] text-[#4facfe] rounded-lg hover:bg-[#e6f0fa] hover:text-[#2e8df7] transition-all"
            >
              Logout
            </button>
          </div>

          <div className="md:hidden mb-6">
            <MobileNav currentPage="/complaints" />
          </div>
        </div>

        <div className="mb-6 md:mb-8 space-y-4">
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-[#e6f0fa]/40 border border-[#b3d4fc]/30 rounded-lg text-[#1e293b] placeholder-[#4facfe]/60 focus:outline-none focus:ring-2 focus:ring-[#4facfe] focus:border-transparent"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
            {["all", "pending", "resolved"].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  filter === filterOption
                    ? "bg-[#4facfe] text-white"
                    : "bg-[#e6f0fa]/40 border border-[#b3d4fc]/30 text-[#4facfe] hover:bg-[#b3d4fc]/20"
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                {filterOption !== "all" && (
                  <span className="ml-1">
                    ({complaints.filter((c) => c.status.toLowerCase() === filterOption).length})
                  </span>
                )}
                {filterOption === "all" && <span className="ml-1">({complaints.length})</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 md:mb-8">
          <div className="bg-[#e6f0fa]/40 backdrop-blur-sm border border-[#b3d4fc]/30 rounded-xl p-3 md:p-4 text-center">
            <h3 className="text-xs md:text-sm text-[#4facfe] mb-1">Total</h3>
            <h2 className="text-lg md:text-2xl font-bold text-[#4facfe]">{complaints.length}</h2>
          </div>
          <div className="bg-[#e6f0fa]/40 backdrop-blur-sm border border-[#b3d4fc]/30 rounded-xl p-3 md:p-4 text-center">
            <h3 className="text-xs md:text-sm text-[#4facfe] mb-1">Pending</h3>
            <h2 className="text-lg md:text-2xl font-bold text-[#4facfe]">
              {complaints.filter((c) => c.status === "Pending").length}
            </h2>
          </div>
          <div className="bg-[#e6f0fa]/40 backdrop-blur-sm border border-[#b3d4fc]/30 rounded-xl p-3 md:p-4 text-center">
            <h3 className="text-xs md:text-sm text-[#4facfe] mb-1">Resolved</h3>
            <h2 className="text-lg md:text-2xl font-bold text-[#4facfe]">
              {complaints.filter((c) => c.status === "Resolved").length}
            </h2>
          </div>
          <div className="bg-[#e6f0fa]/40 backdrop-blur-sm border border-[#b3d4fc]/30 rounded-xl p-3 md:p-4 text-center">
            <h3 className="text-xs md:text-sm text-[#4facfe] mb-1">Showing</h3>
            <h2 className="text-lg md:text-2xl font-bold text-[#4facfe]">{filteredComplaints.length}</h2>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="bg-[#e6f0fa]/40 backdrop-blur-sm border border-[#b3d4fc]/30 rounded-xl p-4 md:p-6 hover:bg-[#e6f0fa]/60 transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-semibold text-[#4facfe] mb-2">{complaint.title}</h3>
                    <p className="text-[#1e293b] mb-2 text-sm md:text-base leading-relaxed">{complaint.description}</p>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mt-2 md:mt-0 md:ml-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                        complaint.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                          : "bg-green-100 text-green-700 border border-green-200"
                      }`}
                    >
                      {complaint.status}
                    </span>
                    {user?.role === "authority" && (
                      <div className="flex gap-2">
                        {complaint.status === "Pending" && (
                          <button
                            onClick={() => updateComplaintStatus(complaint.id, "Resolved")}
                            disabled={updatingStatus === complaint.id}
                            className="px-3 py-1 bg-green-500 text-white text-xs md:text-sm rounded-lg hover:bg-green-600 disabled:bg-green-300 transition-colors flex items-center gap-1"
                          >
                            {updatingStatus === complaint.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                Updating...
                              </>
                            ) : (
                              <>✓ Mark Resolved</>
                            )}
                          </button>
                        )}
                        {complaint.status === "Resolved" && (
                          <button
                            onClick={() => updateComplaintStatus(complaint.id, "Pending")}
                            disabled={updatingStatus === complaint.id}
                            className="px-3 py-1 bg-yellow-500 text-white text-xs md:text-sm rounded-lg hover:bg-yellow-600 disabled:bg-yellow-300 transition-colors flex items-center gap-1"
                          >
                            {updatingStatus === complaint.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                Updating...
                              </>
                            ) : (
                              <>↻ Mark Pending</>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between text-xs md:text-sm text-[#4facfe] space-y-1 md:space-y-0">
                  <span className="flex items-center">
                    <span className="font-medium mr-1">Category:</span> {complaint.category}
                  </span>
                  <span className="flex items-center">
                    <span className="font-medium mr-1">Constituency:</span> {complaint.constituency}
                  </span>
                  <span className="flex items-center">
                    <span className="font-medium mr-1">Date:</span> {complaint.date}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl md:text-6xl mb-4">📋</div>
              <h3 className="text-xl md:text-2xl text-[#4facfe] mb-2">
                {searchTerm || filter !== "all" ? "No matching complaints found" : "No Complaints Yet"}
              </h3>
              <p className="text-[#1e293b] mb-6 text-sm md:text-base">
                {searchTerm || filter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Start by reporting your first issue"}
              </p>
              {!searchTerm && filter === "all" && (
                <button
                  onClick={() => router.push("/report")}
                  className="px-6 py-3 bg-[#4facfe] text-white rounded-lg hover:bg-[#2e8df7] transition-colors text-sm md:text-base"
                >
                  Report an Issue
                </button>
              )}
              {(searchTerm || filter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("")
                    setFilter("all")
                  }}
                  className="px-6 py-3 bg-[#4facfe] text-white rounded-lg hover:bg-[#2e8df7] transition-colors text-sm md:text-base"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
