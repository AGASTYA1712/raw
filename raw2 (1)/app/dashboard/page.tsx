"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Chart, registerables } from "chart.js"
import MobileNav from "../../components/mobile-nav"
Chart.register(...registerables)

interface Complaint {
  id: string
  category: string
  constituency: string
  status: string
  title: string
  description: string
  date: string
}

export default function Dashboard() {
  const router = useRouter()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [stats, setStats] = useState({
    pending: 0,
    resolved: 0,
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Refs for chart instances and canvases
  const categoryChartRef = useRef<any>(null)
  const districtChartRef = useRef<any>(null)
  const categoryCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const districtCanvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    try {
      // Load complaints from localStorage
      const STORAGE_COMPLAINTS = "citycare_complaints_v1"
      const storedComplaints = JSON.parse(localStorage.getItem(STORAGE_COMPLAINTS) || "[]")
      setComplaints(storedComplaints)

      // Calculate stats
      const pendingCount = storedComplaints.filter((c: Complaint) => c.status === "Pending").length
      const totalCount = storedComplaints.length
      const resolvedCount = totalCount - pendingCount

      setStats({
        pending: pendingCount,
        resolved: resolvedCount,
        total: totalCount,
      })

      setLoading(false)
    } catch (err) {
      console.error("[v0] Error loading complaints:", err)
      setError("Failed to load complaints data")
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!loading && categoryCanvasRef.current && districtCanvasRef.current && typeof window !== "undefined") {
      // Wait for Chart.js to be available
      const initCharts = () => {
        if (typeof window.Chart === "undefined") {
          setTimeout(initCharts, 100)
          return
        }

        try {
          // Destroy existing charts if they exist
          if (categoryChartRef.current) categoryChartRef.current.destroy()
          if (districtChartRef.current) districtChartRef.current.destroy()

          // Calculate chart data
          const categoryCounts = complaints.reduce(
            (acc, c) => {
              acc[c.category] = (acc[c.category] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          )

          const constituencyCounts = complaints.reduce(
            (acc, c) => {
              acc[c.constituency] = (acc[c.constituency] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          )

          // Category Chart
          if (Object.keys(categoryCounts).length > 0) {
            categoryChartRef.current = new window.Chart(categoryCanvasRef.current, {
              type: "pie",
              data: {
                labels: Object.keys(categoryCounts),
                datasets: [
                  {
                    data: Object.values(categoryCounts),
                    backgroundColor: ["#b3d4fc", "#93c5fd", "#60a5fa", "#4facfe", "#e6f0fa"],
                    borderWidth: 0,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom", labels: { color: "#1e293b" } },
                  title: { display: true, text: "Complaints by Category", color: "#1e293b" },
                },
              },
            })
          }

          // District Chart
          if (Object.keys(constituencyCounts).length > 0) {
            districtChartRef.current = new window.Chart(districtCanvasRef.current, {
              type: "bar",
              data: {
                labels: Object.keys(constituencyCounts),
                datasets: [
                  {
                    label: "Complaint Count",
                    data: Object.values(constituencyCounts),
                    backgroundColor: "#4facfe",
                    borderRadius: 5,
                    barPercentage: 0.6,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { ticks: { color: "#1e293b" }, grid: { color: "#b3d4fc" } },
                  y: { beginAtZero: true, ticks: { color: "#1e293b" }, grid: { color: "#b3d4fc" } },
                },
                plugins: {
                  legend: { display: false },
                  title: { display: true, text: "Complaints by Constituency", color: "#1e293b" },
                },
              },
            })
          }
        } catch (err) {
          console.error("[v0] Error initializing charts:", err)
          setError("Failed to load charts")
        }
      }

      initCharts()
    }
  }, [complaints, loading])

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      if (categoryChartRef.current) categoryChartRef.current.destroy()
      if (districtChartRef.current) districtChartRef.current.destroy()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e6f0fa] via-[#93c5fd] to-[#b3d4fc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e6f0fa] via-[#93c5fd] to-[#b3d4fc] flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-lg mb-2">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f0fa] via-[#93c5fd] to-[#b3d4fc] text-[#1e293b] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-[#4facfe] mb-4 md:mb-6 tracking-wide">
            COMPLAINT DASHBOARD
          </h1>

          {/* Navigation */}
          <div className="hidden md:flex justify-center gap-4 mb-8">
            <button
              onClick={() => router.push("/")}
              className="px-4 md:px-6 py-2 bg-transparent border border-[#b3d4fc] text-[#4facfe] rounded-lg hover:bg-[#e6f0fa] hover:text-[#2e8df7] transition-all"
            >
              Home
            </button>
            <button
              onClick={() => router.push("/complaints")}
              className="px-4 md:px-6 py-2 bg-transparent border border-[#b3d4fc] text-[#4facfe] rounded-lg hover:bg-[#e6f0fa] hover:text-[#2e8df7] transition-all"
            >
              All Complaints
            </button>
            <button className="px-4 md:px-6 py-2 bg-[#4facfe] text-white rounded-lg">Dashboard</button>
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
            <MobileNav currentPage="/dashboard" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-[#e6f0fa]/40 backdrop-blur-sm border border-[#b3d4fc]/30 rounded-xl p-4 md:p-6 text-center active:transform active:scale-95 transition-all">
            <h3 className="text-base md:text-lg text-[#4facfe] mb-2">Pending</h3>
            <h2 className="text-2xl md:text-3xl font-bold text-[#4facfe]">{stats.pending}</h2>
          </div>
          <div className="bg-[#e6f0fa]/40 backdrop-blur-sm border border-[#b3d4fc]/30 rounded-xl p-4 md:p-6 text-center active:transform active:scale-95 transition-all">
            <h3 className="text-base md:text-lg text-[#4facfe] mb-2">Resolved</h3>
            <h2 className="text-2xl md:text-3xl font-bold text-[#4facfe]">{stats.resolved}</h2>
          </div>
          <div className="bg-[#e6f0fa]/40 backdrop-blur-sm border border-[#b3d4fc]/30 rounded-xl p-4 md:p-6 text-center active:transform active:scale-95 transition-all">
            <h3 className="text-base md:text-lg text-[#4facfe] mb-2">Total Complaints</h3>
            <h2 className="text-2xl md:text-3xl font-bold text-[#4facfe]">{stats.total}</h2>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Complaints by Category Table */}
          <div className="bg-[#e6f0fa]/40 backdrop-blur-sm border border-[#b3d4fc]/30 rounded-xl p-4 md:p-6">
            <h3 className="text-lg md:text-xl text-[#4facfe] mb-4">Complaints by Category</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="bg-[#b3d4fc]/40">
                    <th className="text-left p-2 md:p-3 text-[#1e293b]">Category</th>
                    <th className="text-left p-2 md:p-3 text-[#1e293b]">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    complaints.reduce(
                      (acc, c) => {
                        acc[c.category] = (acc[c.category] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>,
                    ),
                  ).length > 0 ? (
                    Object.entries(
                      complaints.reduce(
                        (acc, c) => {
                          acc[c.category] = (acc[c.category] || 0) + 1
                          return acc
                        },
                        {} as Record<string, number>,
                      ),
                    ).map(([category, count]) => (
                      <tr key={category} className="border-b border-[#b3d4fc]/20">
                        <td className="p-2 md:p-3 text-[#1e293b]">{category}</td>
                        <td className="p-2 md:p-3 text-[#4facfe] font-semibold">{count}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="p-2 md:p-3 text-[#4facfe] text-center">
                        No complaints yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Complaints by Constituency */}
          <div className="bg-[#e6f0fa]/40 backdrop-blur-sm border border-[#b3d4fc]/30 rounded-xl p-4 md:p-6">
            <h3 className="text-lg md:text-xl text-[#4facfe] mb-4">Complaints by Constituency</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Object.entries(
                complaints.reduce(
                  (acc, c) => {
                    acc[c.constituency] = (acc[c.constituency] || 0) + 1
                    return acc
                  },
                  {} as Record<string, number>,
                ),
              ).length > 0 ? (
                Object.entries(
                  complaints.reduce(
                    (acc, c) => {
                      acc[c.constituency] = (acc[c.constituency] || 0) + 1
                      return acc
                    },
                    {} as Record<string, number>,
                  ),
                ).map(([constituency, count]) => (
                  <div
                    key={constituency}
                    className="flex justify-between items-center p-2 md:p-3 bg-[#b3d4fc]/20 rounded-lg text-sm md:text-base"
                  >
                    <span className="text-[#1e293b] truncate mr-2">{constituency}</span>
                    <span className="text-[#4facfe] font-semibold whitespace-nowrap">{count} complaints</span>
                  </div>
                ))
              ) : (
                <div className="text-[#4facfe] text-center p-4">No complaints yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-[#e6f0fa]/40 backdrop-blur-sm border border-[#b3d4fc]/30 rounded-xl p-4 md:p-6">
            <h3 className="text-lg md:text-xl text-[#4facfe] mb-4 text-center">Category Distribution</h3>
            <div className="h-48 md:h-64 relative">
              {complaints.length > 0 ? (
                <canvas ref={categoryCanvasRef} id="categoryChart"></canvas>
              ) : (
                <div className="flex items-center justify-center h-full text-[#4facfe]">No data to display</div>
              )}
            </div>
          </div>

          <div className="bg-[#e6f0fa]/40 backdrop-blur-sm border border-[#b3d4fc]/30 rounded-xl p-4 md:p-6">
            <h3 className="text-lg md:text-xl text-[#4facfe] mb-4 text-center">Constituency Distribution</h3>
            <div className="h-48 md:h-64 relative">
              {complaints.length > 0 ? (
                <canvas ref={districtCanvasRef} id="districtChart"></canvas>
              ) : (
                <div className="flex items-center justify-center h-full text-[#4facfe]">No data to display</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
