'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStoreValue } from '@simplestack/store/react'
import { tokenStore } from '@/lib/auth-store'
import { linksApi, Link } from '@/lib/api'
import { ProtectedRoute } from '@/components/protected-route'
import { DashboardHeader } from '@/components/dashboard-header'
import { LinkItem } from '@/components/link-item'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const router = useRouter()
  const token = useStoreValue(tokenStore)
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (token) {
      loadLinks()
    }
  }, [token])

  const loadLinks = async () => {
    if (!token) return
    
    try {
      const data = await linksApi.getLinks(token)
      setLinks(data)
    } catch (error) {
      console.error('[v0] Failed to load links:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    if (!token) return
    
    await linksApi.deleteLink(token, linkId)
    setLinks(links.filter(link => link.id !== linkId))
  }

  const filteredLinks = links.filter(link =>
    link.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <DashboardHeader />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header with Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold mb-2 tracking-tight">{'My Links'}</h1>
              <p className="text-muted-foreground text-lg">
                {'Manage and track all your shortened links'}
              </p>
            </div>
            <Button
              size="lg"
              className="gap-2 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              onClick={() => router.push('/dashboard/new')}
            >
              <Plus className="w-5 h-5" />
              {'Create new link'}
            </Button>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-card/50 p-4 rounded-3xl border border-border backdrop-blur-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by short link or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg bg-background/80"
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-6 rounded-xl border-2">
                    {'Filter'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>{'All links'}</DropdownMenuItem>
                  <DropdownMenuItem>{'Most clicks'}</DropdownMenuItem>
                  <DropdownMenuItem>{'Least clicks'}</DropdownMenuItem>
                  <DropdownMenuItem>{'Newest first'}</DropdownMenuItem>
                  <DropdownMenuItem>{'Oldest first'}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-6 rounded-xl border-2">
                    {'Display'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>{'Compact view'}</DropdownMenuItem>
                  <DropdownMenuItem>{'Detailed view'}</DropdownMenuItem>
                  <DropdownMenuItem>{'Grid view'}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Links List */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">{'Loading links...'}</p>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl bg-card/30">
              <p className="text-muted-foreground mb-6 text-lg">
                {searchQuery ? 'No links match your search' : 'No links yet'}
              </p>
              {!searchQuery && (
                <Button onClick={() => router.push('/dashboard/new')} size="lg" className="rounded-full">
                  {'Create your first link'}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLinks.map(link => (
                <LinkItem
                  key={link.id}
                  link={link}
                  onDelete={handleDeleteLink}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
