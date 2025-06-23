"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "../contexts/LanguageContext"
import { useNotifications } from "../contexts/NotificationContext"
import LanguageToggle from "./LanguageToggle"
import NotificationsPage from "./NotificationsPage"
import JobsPage from "./JobsPage"
import JobDetailsPage from "./JobDetailsPage"
import { Bell, Briefcase, ArrowLeft, LogOut } from "lucide-react"

interface DashboardProps {
  onLogout: () => void
  driverId: number | null
}

type Page = "notifications" | "jobs" | "jobDetails"

const Dashboard = ({ onLogout, driverId }: DashboardProps) => {
  const [currentPage, setCurrentPage] = useState<Page>("notifications")
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const { t } = useLanguage()
  const { backendNotifications } = useNotifications()

  // Calculate unread count from backend notifications
  const unreadCount = backendNotifications.filter((notification) => !notification.isRead).length

  const navigateToJobDetails = (jobId: string) => {
    setSelectedJobId(jobId)
    setCurrentPage("jobDetails")
  }

  const goBack = () => {
    if (currentPage === "jobDetails") {
      setCurrentPage("jobs")
      setSelectedJobId(null)
    }
  }

  const getPageTitle = () => {
    switch (currentPage) {
      case "notifications":
        return t("notifications")
      case "jobs":
        return t("jobs")
      case "jobDetails":
        return t("jobDetails")
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            {currentPage === "jobDetails" && (
              <Button variant="ghost" size="sm" onClick={goBack} className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center space-x-3">
            <LanguageToggle />
            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50 rounded-full p-2"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {currentPage === "notifications" && <NotificationsPage driverId={driverId} />}
        {currentPage === "jobs" && <JobsPage onJobSelect={navigateToJobDetails} driverId={driverId} />}
        {currentPage === "jobDetails" && selectedJobId && <JobDetailsPage jobId={selectedJobId} driverId={driverId} />}
      </div>

      {/* Bottom Navigation */}
      {currentPage !== "jobDetails" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex">
            <button
              onClick={() => setCurrentPage("jobs")}
              className={`flex-1 py-4 px-4 text-center transition-all duration-200 ${
                currentPage === "jobs"
                  ? "text-blue-600 bg-blue-50 border-t-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <Briefcase className="w-6 h-6" />
                <span className="text-xs font-medium">{t("jobs")}</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentPage("notifications")}
              className={`flex-1 py-4 px-4 text-center transition-all duration-200 relative ${
                currentPage === "notifications"
                  ? "text-blue-600 bg-blue-50 border-t-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <div className="relative">
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{t("notifications")}</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
