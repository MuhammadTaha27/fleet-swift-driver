"use client"

import { AlertCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "../contexts/LanguageContext"
import LanguageToggle from "./LanguageToggle"

interface PermissionDeniedProps {
  onLogout: () => void
  userRole: string
}

const PermissionDenied = ({ onLogout, userRole }: PermissionDeniedProps) => {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="absolute top-6 right-6">
        <LanguageToggle />
      </div>

      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{t("accessDenied")}</CardTitle>
          <p className="text-gray-500 text-sm">{t("permissionRequired")}</p>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          <div className="text-center space-y-4">
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-700 text-sm font-medium">{t("noPermission")}</p>
              <p className="text-red-600 text-xs mt-2">{t("loginAsDriver")}</p>
              <p className="text-gray-500 text-xs mt-2">
                {t("currentRole")}: <span className="font-medium">{userRole}</span>
              </p>
            </div>

            <Button
              onClick={onLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <LogOut className="w-5 h-5 mr-2" />
              {t("logoutTryAgain")}
            </Button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">{t("contactAdmin")}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default PermissionDenied
