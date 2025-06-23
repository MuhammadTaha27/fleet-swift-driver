// Utility functions for JWT token handling

export interface JWTPayload {
    sub: number // user ID
    role: string
    email: string
    iat: number
    exp: number
  }
  
  /**
   * Decode JWT token without verification (client-side only)
   * Note: This is for reading the payload, not for security validation
   */
  export function decodeJWT(token: string): JWTPayload | null {
    try {
      const parts = token.split(".")
      if (parts.length !== 3) {
        return null
      }
  
      const payload = parts[1]
      const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
      return JSON.parse(decoded) as JWTPayload
    } catch (error) {
      console.error("Error decoding JWT:", error)
      return null
    }
  }
  
  /**
   * Get user ID from stored JWT token
   */
  export function getUserIdFromToken(): number | null {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        return null
      }
  
      const payload = decodeJWT(token)
      return payload?.sub || null
    } catch (error) {
      console.error("Error getting user ID from token:", error)
      return null
    }
  }
  
  /**
   * Check if JWT token is expired
   */
  export function isTokenExpired(token: string): boolean {
    try {
      const payload = decodeJWT(token)
      if (!payload) {
        return true
      }
  
      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp < currentTime
    } catch (error) {
      console.error("Error checking token expiration:", error)
      return true
    }
  }
  