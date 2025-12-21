"use client"

import { useState, useEffect } from "react"
import { LeaderboardTable } from "@/components/leaderboard-table"
import { LoginDialog } from "@/components/login-dialog"
import { Sword, Skull, Clock, LogIn, LogOut, User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Page() {
  const [activeCategory, setActiveCategory] = useState<"playtime" | "kills" | "deaths">("playtime")
  const [showLogin, setShowLogin] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const savedUser = localStorage.getItem("verified_username")
    if (savedUser) {
      setLoggedInUser(savedUser)
    }
  }, [])

  const handleLogin = (username: string) => {
    setLoggedInUser(username)
    localStorage.setItem("verified_username", username)
  }

  const handleLogout = () => {
    setLoggedInUser(null)
    localStorage.removeItem("verified_username")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/images/jangamar-logo.png" alt="Jangamar SMP" className="h-16 w-auto object-contain" />
            </div>

            <div className="flex items-center gap-3">
              {/* Discord Button */}
              <a
                href="https://discord.gg/your-server"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-foreground h-12"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.076.076 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.077.077 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span className="text-sm font-medium">Discord</span>
              </a>

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

              {/* Login/Logout */}
              {loggedInUser ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 h-12">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{loggedInUser}</span>
                  </div>
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
        <section className="w-full mb-8">
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setActiveCategory("playtime")}
                className={`group flex flex-col items-center gap-2 rounded-lg px-6 py-4 transition-all ${
                  activeCategory === "playtime" ? "bg-primary shadow-lg shadow-primary/20" : ""
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
                    activeCategory === "playtime" ? "bg-primary-foreground/10" : "bg-primary/10"
                  }`}
                >
                  <Clock
                    className={`h-6 w-6 ${activeCategory === "playtime" ? "text-primary-foreground" : "text-primary"}`}
                  />
                </div>
                <span
                  className={`text-sm font-semibold ${
                    activeCategory === "playtime" ? "text-primary-foreground" : "text-foreground"
                  }`}
                >
                  Playtime
                </span>
              </button>

              <button
                onClick={() => setActiveCategory("kills")}
                className={`group flex flex-col items-center gap-2 rounded-lg px-6 py-4 transition-all ${
                  activeCategory === "kills" ? "bg-accent shadow-lg shadow-accent/20" : ""
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
                    activeCategory === "kills" ? "bg-accent-foreground/10" : "bg-accent/10"
                  }`}
                >
                  <Sword
                    className={`h-6 w-6 ${activeCategory === "kills" ? "text-accent-foreground" : "text-accent"}`}
                  />
                </div>
                <span
                  className={`text-sm font-semibold ${
                    activeCategory === "kills" ? "text-accent-foreground" : "text-foreground"
                  }`}
                >
                  Kills
                </span>
              </button>

              <button
                onClick={() => setActiveCategory("deaths")}
                className={`group flex flex-col items-center gap-2 rounded-lg px-6 py-4 transition-all ${
                  activeCategory === "deaths" ? "bg-destructive shadow-lg shadow-destructive/20" : ""
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
                    activeCategory === "deaths" ? "bg-destructive-foreground/10" : "bg-destructive/10"
                  }`}
                >
                  <Skull
                    className={`h-6 w-6 ${activeCategory === "deaths" ? "text-destructive-foreground" : "text-destructive"}`}
                  />
                </div>
                <span
                  className={`text-sm font-semibold ${
                    activeCategory === "deaths" ? "text-destructive-foreground" : "text-foreground"
                  }`}
                >
                  Deaths
                </span>
              </button>
            </div>
          </div>
        </section>

        <LeaderboardTable category={activeCategory} searchQuery={searchQuery} />
      </div>

      {showLogin && <LoginDialog onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
    </div>
  )
}
