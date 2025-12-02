'use client'

import { useEffect } from 'react'
import { useStoreValue } from '@simplestack/store/react'
import { isLoadingStore, checkAuth } from '@/lib/auth-store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isLoading = useStoreValue(isLoadingStore)

  useEffect(() => {
    // Check authentication status on mount
    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
