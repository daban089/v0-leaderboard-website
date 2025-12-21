"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trophy, Crown, Medal, Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Player {
  rank: number
  username: string
  playtime: number
  kills: number
  deaths: number
}

interface LeaderboardTableProps {
  category: "playtime" | "kills" | "deaths"
}

export function LeaderboardTable({ category }: LeaderboardTableProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [avatarCache, setAvatarCache] = useState<Record<string, string>>({})

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/leaderboard")
      const data = await response.json()
      if (Array.isArray(data)) {
        const sortedPlayers = [...data].sort((a, b) => {
          if (category === "playtime") return b.playtime - a.playtime
          if (category === "kills") return b.kills - a.kills
          if (category === "deaths") return b.deaths - a.deaths
          return 0
        })

        const rankedPlayers = sortedPlayers.map((player, index) => ({
          ...player,
          rank: index + 1,
        }))

        setPlayers(rankedPlayers)
        setLastUpdated(new Date())
      } else {
        setPlayers([])
      }
    } catch (error) {
      console.error("[v0] Failed to fetch leaderboard:", error)
      setPlayers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [category])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchLeaderboard()
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh, category])

  const filteredPlayers = players.filter((player) => player.username.toLowerCase().includes(searchQuery.toLowerCase()))

  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-yellow-400/20 to-yellow-600/20 border-yellow-500/50"
    if (rank === 2) return "from-gray-300/20 to-gray-500/20 border-gray-400/50"
    if (rank === 3) return "from-orange-400/20 to-orange-600/20 border-orange-500/50"
    return "from-card to-card border-border"
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/90 text-yellow-950 border-yellow-400"
    if (rank === 2) return "bg-gray-400/90 text-gray-950 border-gray-300"
    if (rank === 3) return "bg-orange-500/90 text-orange-950 border-orange-400"
    return "bg-muted text-muted-foreground border-border"
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4" />
    if (rank === 2) return <Medal className="h-4 w-4" />
    if (rank === 3) return <Trophy className="h-4 w-4" />
    return null
  }

  const getAvatarUrl = (username: string) => {
    if (username.toLowerCase() === "bafr") {
      return "https://render.crafty.gg/3d/bust/9b39e8088ffb8a1fe2f88f64672c4c18384abe204a99e85326ac4947fd1c50f3"
    }

    // Check cache first
    if (avatarCache[username]) {
      return avatarCache[username]
    }

    // Fetch from crafty.gg API
    fetch(`/api/crafty-avatar?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        const url = data.avatarUrl || data.fallback
        setAvatarCache((prev) => ({ ...prev, [username]: url }))
      })
      .catch(() => {
        // Fallback to crafatar
        const fallbackUrl = `https://crafatar.com/renders/bust/${username}?scale=4&overlay=true`
        setAvatarCache((prev) => ({ ...prev, [username]: fallbackUrl }))
      })

    // Return temporary URL while loading
    return `https://crafatar.com/renders/bust/${username}?scale=4&overlay=true`
  }

  const getStatValue = (player: Player) => {
    if (category === "playtime") return `${player.playtime.toLocaleString()} hours`
    if (category === "kills") return `${player.kills} kills`
    if (category === "deaths") return `${player.deaths} deaths`
    return ""
  }

  const getCategoryTitle = () => {
    if (category === "playtime") return "Top Players by Playtime"
    if (category === "kills") return "Top Players by Kills"
    if (category === "deaths") return "Most Deaths"
    return "Player Rankings"
  }

  const getShimmerUrl = (rank: number) => {
    if (rank === 1) return "/shimmer.svg"
    if (rank === 2) return "/shimmer-silver.svg"
    if (rank === 3) return "/shimmer-bronze.svg"
    return "/shimmer.svg"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getCategoryTitle()}</CardTitle>
          <CardDescription>Loading player statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{getCategoryTitle()}</CardTitle>
            <CardDescription>
              {category === "playtime" && "Players with the most time on the server"}
              {category === "kills" && "Players with the most player kills"}
              {category === "deaths" && "Players with the most deaths"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-primary/10" : ""}
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />
              <span className="ml-2 hidden sm:inline">{autoRefresh ? "Auto" : "Manual"}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={fetchLeaderboard} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredPlayers.map((player) => (
            <div
              key={player.username}
              className="relative flex items-center gap-6 rounded-xl border border-border overflow-hidden p-4 transition-all hover:scale-[1.01] hover:shadow-lg"
              style={{
                backgroundImage: `url('${getShimmerUrl(player.rank)}')`,
                backgroundSize: "240px 80px",
                backgroundPosition: "left center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="relative h-[80px] w-[240px] flex-shrink-0 flex items-center overflow-hidden">
                <span
                  className={`absolute left-4 text-5xl font-black italic font-sans text-white z-10`}
                  style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}
                >
                  {player.rank}.
                </span>
                <img
                  src={getAvatarUrl(player.username) || "/placeholder.svg"}
                  alt={player.username}
                  className="absolute right-14 top-[2px] h-[88px] w-[88px] object-contain z-10"
                  style={{ filter: "drop-shadow(-4px 0px 0.8px rgba(0, 0, 0, 0.3))" }}
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=88&width=88"
                  }}
                />
              </div>

              <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xl font-bold text-foreground">{player.username}</p>
                  <p className="text-sm text-muted-foreground">{getStatValue(player)}</p>
                </div>

                <div className="flex gap-3">
                  <div className="rounded-lg bg-primary/10 px-3 py-2 text-center">
                    <p className="text-xs font-medium text-muted-foreground">Time</p>
                    <p className="text-sm font-bold text-primary">{player.playtime.toLocaleString()}h</p>
                  </div>
                  <div className="rounded-lg bg-accent/10 px-3 py-2 text-center">
                    <p className="text-xs font-medium text-muted-foreground">Kills</p>
                    <p className="text-sm font-bold text-accent">{player.kills}</p>
                  </div>
                  <div className="rounded-lg bg-destructive/10 px-3 py-2 text-center">
                    <p className="text-xs font-medium text-muted-foreground">Deaths</p>
                    <p className="text-sm font-bold text-destructive">{player.deaths}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredPlayers.length === 0 && !loading && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? `No players found matching "${searchQuery}"` : "No players found"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
