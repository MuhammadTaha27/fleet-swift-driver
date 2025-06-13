"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "../contexts/LanguageContext"
import LanguageToggle from "./LanguageToggle"
import { User, Lock, Truck } from "lucide-react"
import { loginUser, type LoginData } from "../services/user"
import { storeAuthTokenInIndexedDB } from "@/utilis/auth-storage"

interface LoginPageProps {
  onLogin: () => void
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const loginData: LoginData = {
        userEmail: email,
        password: password,
      }

      const response = await loginUser(loginData)

      // Store the token in localStorage
      localStorage.setItem("authToken", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))

      // Also store in IndexedDB for service worker access
      try {
        await storeAuthTokenInIndexedDB(response.token)
      } catch (indexedDBError) {
        console.warn("Failed to store token in IndexedDB:", indexedDBError)
        // Continue anyway as localStorage is the primary storage
      }

      console.log("Login successful:", response)
      onLogin()
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : t("login") + " failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="absolute top-6 right-6">
        <LanguageToggle />
      </div>

      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{t("welcome")}</CardTitle>
          <p className="text-gray-500 text-sm">Fleet Management System</p>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  placeholder={t("email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 border-gray-200 focus:border-blue-500 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="password"
                  placeholder={t("password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-12 border-gray-200 focus:border-blue-500 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? t("signingIn") : t("signIn")}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">{t("secureAuth")}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
