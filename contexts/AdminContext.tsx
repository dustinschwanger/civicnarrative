'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

interface AdminUser {
  id: string
  email: string
  is_super_admin: boolean
}

interface AdminContextType {
  adminUser: AdminUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAdminAuth: () => Promise<boolean>
  error: string | null
}

const AdminContext = createContext<AdminContextType>({
  adminUser: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  checkAdminAuth: async () => false,
  error: null,
})

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async (): Promise<boolean> => {
    try {
      setLoading(true)

      // Check if there's an admin session token
      const sessionToken = localStorage.getItem('adminSession')
      if (!sessionToken) {
        setAdminUser(null)
        setLoading(false)
        return false
      }

      // Verify the session token in the database
      const { data: session, error: sessionError } = await supabase
        .from('admin_sessions')
        .select('*, user_profiles!admin_sessions_auth_id_fkey(*)')
        .eq('token', sessionToken)
        .single()

      if (sessionError || !session) {
        localStorage.removeItem('adminSession')
        setAdminUser(null)
        setLoading(false)
        return false
      }

      // Check if session is expired
      const expiresAt = new Date(session.expires_at)
      if (expiresAt < new Date()) {
        localStorage.removeItem('adminSession')
        await supabase.from('admin_sessions').delete().eq('token', sessionToken)
        setAdminUser(null)
        setLoading(false)
        return false
      }

      // Check if user is super admin
      const profile = Array.isArray(session.user_profiles)
        ? session.user_profiles[0]
        : session.user_profiles

      if (!profile || !profile.is_super_admin) {
        localStorage.removeItem('adminSession')
        setAdminUser(null)
        setLoading(false)
        return false
      }

      setAdminUser({
        id: session.auth_id,
        email: profile.email,
        is_super_admin: true,
      })
      setLoading(false)
      return true
    } catch (err) {
      console.error('Error checking admin auth:', err)
      setAdminUser(null)
      setLoading(false)
      return false
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No user data returned')

      // Check if user is super admin
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_id', authData.user.id)
        .single()

      if (profileError) throw profileError
      if (!profile.is_super_admin) {
        await supabase.auth.signOut()
        throw new Error('Unauthorized: Admin access required')
      }

      // Create admin session
      const sessionToken = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 8) // 8 hour session

      const { error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({
          auth_id: authData.user.id,
          token: sessionToken,
          expires_at: expiresAt.toISOString(),
        })

      if (sessionError) throw sessionError

      // Store session token
      localStorage.setItem('adminSession', sessionToken)

      setAdminUser({
        id: authData.user.id,
        email: profile.email,
        is_super_admin: true,
      })
      setLoading(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to login'
      setError(message)
      setLoading(false)
      throw new Error(message)
    }
  }

  const logout = async () => {
    try {
      setError(null)
      const sessionToken = localStorage.getItem('adminSession')

      if (sessionToken) {
        // Delete session from database
        await supabase.from('admin_sessions').delete().eq('token', sessionToken)
        localStorage.removeItem('adminSession')
      }

      // Sign out from Supabase Auth
      await supabase.auth.signOut()
      setAdminUser(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to logout'
      setError(message)
      throw new Error(message)
    }
  }

  return (
    <AdminContext.Provider
      value={{
        adminUser,
        loading,
        login,
        logout,
        checkAdminAuth,
        error,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

// Higher-order component for protecting admin routes
// TEMPORARILY DISABLED FOR DEVELOPMENT
export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AdminProtectedRoute(props: P) {
    // Authentication check disabled - directly render component
    return <Component {...props} />
  }
}
