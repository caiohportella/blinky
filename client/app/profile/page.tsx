'use client'

import { useRouter } from 'next/navigation'
import { useStoreValue } from '@simplestack/store/react'
import { userStore, signout } from '@/lib/auth-store'
import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/logo'

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const router = useRouter()
  const user = useStoreValue(userStore)

  const handleSignOut = async () => {
    await signout()
    router.push('/')
  }

  // User is guaranteed to exist here due to ProtectedRoute
  if (!user) return null

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="rounded-full">
            {'Back to Dashboard'}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl relative z-10">
        <Card className="shadow-xl border-primary/20">
          <CardHeader className="text-center pb-8">
            <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <CardTitle className="text-3xl font-bold">{'Profile Settings'}</CardTitle>
            <CardDescription className="text-lg">{'Manage your account information'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label className="text-base">Name</Label>
                <Input value={user.name} disabled className="bg-muted/50 font-medium text-lg" />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Email</Label>
                <Input value={user.email} disabled className="bg-muted/50 font-medium text-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base">Role</Label>
                  <div>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize px-4 py-1 text-sm rounded-full">
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Member Since</Label>
                  <div className="text-lg font-medium px-1">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-border flex justify-center">
              <Button variant="destructive" size="lg" onClick={handleSignOut} className="rounded-full px-8 w-full sm:w-auto">
                {'Sign out'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
