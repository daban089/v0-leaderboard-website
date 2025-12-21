"use client"

import { useState, useEffect } from "react"
import { LeaderboardTable } from "@/components/leaderboard-table"
import { LoginDialog } from "@/components/login-dialog"
import { Trophy, Sword, Skull, Clock, LogIn, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Page() {
  const [activeCategory, setActiveCategory] = useState<"playtime" | "kills" | "deaths">("playtime")
  const [totalStats, setTotalStats] = useState({ playtime: 0, kills: 0, deaths: 0 })
  const [showLogin, setShowLogin] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null)

  // Load logged in user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("verified_username")
    if (savedUser) {
      setLoggedInUser(savedUser)
    }
  }, [])

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/leaderboard")
        const data = await response.json()
        if (Array.isArray(data)) {
          const totals = data.reduce(
            (acc, player) => ({
              playtime: acc.playtime + player.playtime,
              kills: acc.kills + player.kills,
              deaths: acc.deaths + player.deaths,
            }),
            { playtime: 0, kills: 0, deaths: 0 },
          )
          setTotalStats(totals)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch stats:", error)
      }
    }
    fetchStats()
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
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Trophy className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-balance">SMP Leaderboard</h1>
                <p className="text-sm text-muted-foreground">Top players on the server</p>
              </div>
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

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Playtime</p>
              <p className="text-2xl font-bold">{totalStats.playtime.toLocaleString()}h</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <Sword className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Kills</p>
              <p className="text-2xl font-bold">{totalStats.kills.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <Skull className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Deaths</p>
              <p className="text-2xl font-bold">{totalStats.deaths.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex gap-2 rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => setActiveCategory("playtime")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
              activeCategory === "playtime"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Clock className="h-4 w-4" />
            Playtime
          </button>
          <button
            onClick={() => setActiveCategory("kills")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
              activeCategory === "kills"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Sword className="h-4 w-4" />
            Kills
          </button>
          <button
            onClick={() => setActiveCategory("deaths")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
              activeCategory === "deaths"
                ? "bg-destructive text-destructive-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Skull className="h-4 w-4" />
            Deaths
          </button>
        </div>

        <LeaderboardTable category={activeCategory} />
      </div>

      {showLogin && <LoginDialog onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
    </div>
  )
}
