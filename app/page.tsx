"use client"

import { useState, useEffect } from "react"
import { LeaderboardTable } from "@/components/leaderboard-table"
import { LoginDialog } from "@/components/login-dialog"
import { NamecardDialog } from "@/components/namecard-dialog"
import { AdminPanel } from "@/components/admin-panel"
import { LogIn, LogOut, User, Palette } from "lucide-react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Page() {
  const [activeKit, setActiveKit] = useState<string>("all")
  const [showLogin, setShowLogin] = useState(false)
  const [showNamecard, setShowNamecard] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [namecardRefreshKey, setNamecardRefreshKey] = useState(0)
  const [canCustomize, setCanCustomize] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem("verified_username")
    if (savedUser) {
      setLoggedInUser(savedUser)
      // Check if user is admin or can customize
      checkUserPermissions(savedUser)
    }
  }, [])

  const checkUserPermissions = async (username: string) => {
    try {
      const response = await fetch("/api/user/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      })
      const data = await response.json()
      setIsAdmin(data.is_admin || false)
      setCanCustomize(data.can_customize_namecard || false)
    } catch (error) {
      console.error("Failed to check permissions:", error)
    }
  }

  const handleLogin = (username: string) => {
    setLoggedInUser(username)
    localStorage.setItem("verified_username", username)
  }

  const handleLogout = () => {
    setLoggedInUser(null)
    localStorage.removeItem("verified_username")
  }

  const handleNamecardChange = () => {
    setNamecardRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/images/jangamar-logo.png" alt="Jangamar's Tiers" className="h-20 w-auto object-contain" />
            </div>

            <div className="flex items-center gap-3">
              {/* Discord Button */}
              <a
                href="https://discord.gg/gzPjF9JNjn"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-foreground h-12"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.076.076 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.077.077 0 0 0-.041-.106a12.299 12.299 0 0 0-1.873-.892a.077.077 0 0 0-.006-.127a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 0 .078.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 0 .078.01c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span className="text-sm font-medium">Discord</span>
              </a>

              {/* Customize Button */}
              {loggedInUser && (
                <button
                  onClick={() => setShowNamecard(true)}
                  className="flex items-center justify-center h-10 w-10 rounded-lg border border-border bg-card hover:bg-accent transition-colors cursor-pointer"
                  title="Customize Namecard"
                >
                  <Palette className="h-5 w-5 text-primary" />
                </button>
              )}

              {/* Search Bar */}
              <div className="relative h-12">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-full w-64 pl-10 pr-4 rounded-full border-border bg-card"
                />
              </div>

              {loggedInUser ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => (isAdmin ? setShowAdmin(true) : setShowNamecard(true))}
                    className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 h-12 hover:bg-accent transition-colors cursor-pointer"
                  >
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{loggedInUser}</span>
                  </button>
                  {/* Logout Button */}
                  <Button variant="outline" size="sm" onClick={handleLogout} className="h-12 bg-transparent">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowLogin(true)} className="h-12">
                  <LogIn className="mr-2 h-4 w-4" />
                  Verify Account
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <LeaderboardTable
          kit={activeKit}
          searchQuery={searchQuery}
          onKitChange={setActiveKit}
          namecardRefreshKey={namecardRefreshKey}
        />
      </div>

      {showLogin && (
        <LoginDialog
          onLogin={(username) => {
            handleLogin(username)
            checkUserPermissions(username)
          }}
          onClose={() => setShowLogin(false)}
        />
      )}
      {showNamecard && loggedInUser && (
        <NamecardDialog
          username={loggedInUser}
          onClose={() => setShowNamecard(false)}
          onSuccess={handleNamecardChange}
        />
      )}
      {showAdmin && isAdmin && <AdminPanel isOpen={showAdmin} onClose={() => setShowAdmin(false)} />}
    </div>
  )
}
