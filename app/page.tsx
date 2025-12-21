"use client"

import { useState, useEffect } from "react"
import { LeaderboardTable } from "@/components/leaderboard-table"
import { LoginDialog } from "@/components/login-dialog"
import { Sword, Skull, Clock, LogIn, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Page() {
  const [activeCategory, setActiveCategory] = useState<"playtime" | "kills" | "deaths">("playtime")
  const [showLogin, setShowLogin] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null)

  // Load logged in user from localStorage
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/images/jangamar-logo.png" alt="Jangamar SMP" className="h-16 w-auto object-contain" />
            </div>

            <div>
              {loggedInUser ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{loggedInUser}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowLogin(true)}>
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
          <div className="flex items-center justify-center gap-3 rounded-lg border border-border bg-card/50 p-3 backdrop-blur-sm">
            <button
              onClick={() => setActiveCategory("playtime")}
              className={`group flex flex-col items-center gap-2 rounded-lg px-6 py-4 transition-all ${
                activeCategory === "playtime" ? "bg-primary shadow-lg shadow-primary/20" : "hover:bg-secondary"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
                  activeCategory === "playtime" ? "bg-primary-foreground/10" : "bg-primary/10 group-hover:bg-primary/20"
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
                activeCategory === "kills" ? "bg-accent shadow-lg shadow-accent/20" : "hover:bg-secondary"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
                  activeCategory === "kills" ? "bg-accent-foreground/10" : "bg-accent/10 group-hover:bg-accent/20"
                }`}
              >
                <Sword className={`h-6 w-6 ${activeCategory === "kills" ? "text-accent-foreground" : "text-accent"}`} />
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
                activeCategory === "deaths" ? "bg-destructive shadow-lg shadow-destructive/20" : "hover:bg-secondary"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
                  activeCategory === "deaths"
                    ? "bg-destructive-foreground/10"
                    : "bg-destructive/10 group-hover:bg-destructive/20"
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
        </section>

        <LeaderboardTable category={activeCategory} />
      </div>

      {showLogin && <LoginDialog onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
    </div>
  )
}
