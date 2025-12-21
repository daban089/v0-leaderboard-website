"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Crown, Medal, RefreshCw, Target, TrendingUp, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Player {
  rank: number
  username: string
  elo: number
  wins: number
  losses: number
  winStreak: number
  kit: string
  // Game mode specific stats
  modes: {
    nodebuff?: { wins: number; losses: number }
    sumo?: { wins: number; losses: number }
    gapple?: { wins: number; losses: number }
    builduhc?: { wins: number; losses: number }
  }
}

interface LeaderboardTableProps {
  category: "elo" | "wins" | "winstreak"
  kit?: string
  searchQuery?: string
  onCategoryChange?: (category: "elo" | "wins" | "winstreak") => void
  onKitChange?: (kit: string) => void
}

interface Badge {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  requirement: string
}

const getBadges = (player: Player): Badge[] => {
  const badges: Badge[] = []

  // ELO badges
  if (player.elo >= 2000) {
    badges.push({
      id: "master",
      name: "Master",
      icon: <Crown className="h-3 w-3" />,
      color: "bg-purple-500/20 text-purple-400 border-purple-500/50",
      requirement: "2000+ ELO",
    })
  } else if (player.elo >= 1500) {
    badges.push({
      id: "expert",
      name: "Expert",
      icon: <Trophy className="h-3 w-3" />,
      color: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      requirement: "1500+ ELO",
    })
  } else if (player.elo >= 1000) {
    badges.push({
      id: "skilled",
      name: "Skilled",
      icon: <Target className="h-3 w-3" />,
      color: "bg-green-500/20 text-green-400 border-green-500/50",
      requirement: "1000+ ELO",
    })
  }

  // Win streak badges
  if (player.winStreak >= 10) {
    badges.push({
      id: "unstoppable",
      name: "Unstoppable",
      icon: <Flame className="h-3 w-3" />,
      color: "bg-red-500/20 text-red-400 border-red-500/50",
      requirement: "10+ win streak",
    })
  } else if (player.winStreak >= 5) {
    badges.push({
      id: "onfire",
      name: "On Fire",
      icon: <TrendingUp className="h-3 w-3" />,
      color: "bg-orange-500/20 text-orange-400 border-orange-500/50",
      requirement: "5+ win streak",
    })
  }

  // Rank badges
  if (player.rank === 1) {
    badges.push({
      id: "first",
      name: "Champion",
      icon: <Crown className="h-3 w-3" />,
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      requirement: "Rank #1",
    })
  } else if (player.rank === 2) {
    badges.push({
      id: "second",
      name: "Runner-up",
      icon: <Medal className="h-3 w-3" />,
      color: "bg-gray-400/20 text-gray-300 border-gray-400/50",
      requirement: "Rank #2",
    })
  } else if (player.rank === 3) {
    badges.push({
      id: "third",
      name: "Top 3",
      icon: <Trophy className="h-3 w-3" />,
      color: "bg-orange-500/20 text-orange-400 border-orange-500/50",
      requirement: "Rank #3",
    })
  }

  return badges
}

export function LeaderboardTable({
  category,
  kit = "all",
  searchQuery: externalSearchQuery,
  onCategoryChange,
  onKitChange,
}: LeaderboardTableProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || "")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [availableKits, setAvailableKits] = useState<string[]>(["all"])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/leaderboard?category=${category}&kit=${kit}`)
      const data = await response.json()
      if (Array.isArray(data)) {
        setPlayers(data)
        setLastUpdated(new Date())
        const kits = ["all", ...new Set(data.map((p: any) => p.kit).filter(Boolean))]
        setAvailableKits(kits)
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
  }, [category, kit])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard()
    }, 60000)

    return () => clearInterval(interval)
  }, [category, kit])

  useEffect(() => {
    setSearchQuery(externalSearchQuery || "")
  }, [externalSearchQuery])

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
    return `/api/avatar-proxy?username=${encodeURIComponent(username)}`
  }

  const getStatValue = (player: Player) => {
    if (category === "elo") return `${player.elo} ELO`
    if (category === "wins") return `${player.wins}W - ${player.losses}L`
    if (category === "winstreak") return `${player.winStreak} Win Streak`
    return ""
  }

  const getCategoryTitle = () => {
    if (category === "elo") return "Top Players by ELO"
    if (category === "wins") return "Top Players by Wins"
    if (category === "winstreak") return "Highest Win Streaks"
    return "Player Rankings"
  }

  const getShimmerUrl = (rank: number) => {
    if (rank === 1) return "/shimmer.svg"
    if (rank === 2) return "/shimmer-silver.svg"
    if (rank === 3) return "/shimmer-bronze.svg"
    return "/shimmer.svg"
  }

  const getKitIcon = (kitName: string) => {
    if (kitName === "all") return <Trophy className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
    if (kitName === "sword") return <Target className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
    if (kitName === "axe") return <Flame className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
    if (kitName === "sumo") return <TrendingUp className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
    return <Trophy className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
  }

  const getKitDisplayName = (kitName: string) => {
    if (kitName === "all") return "Overall"
    return kitName.charAt(0).toUpperCase() + kitName.slice(1)
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
    <div>
      <div className="flex items-end gap-1 mb-4">
        {availableKits.map((kitName) => (
          <button
            key={kitName}
            onClick={() => onKitChange?.(kitName)}
            className={`flex flex-col items-center gap-1 w-28 py-3 rounded-t-3xl transition-all duration-500 ease-in-out ${
              kit === kitName
                ? "bg-card border-t border-l border-r border-border text-foreground opacity-100 translate-y-0"
                : "text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
            }`}
          >
            {getKitIcon(kitName)}
            <span className="text-xs font-medium">{getKitDisplayName(kitName)}</span>
          </button>
        ))}
      </div>

      <div className="flex items-end gap-1">
        <button
          onClick={() => onCategoryChange?.("elo")}
          className={`flex flex-col items-center gap-1 w-28 py-3 rounded-t-3xl transition-all duration-500 ease-in-out ${
            category === "elo"
              ? "bg-card border-t border-l border-r border-border text-foreground opacity-100 translate-y-0"
              : "text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
          }`}
        >
          <Trophy className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
          <span className="text-xs font-medium">ELO</span>
        </button>

        <button
          onClick={() => onCategoryChange?.("wins")}
          className={`flex flex-col items-center gap-1 w-28 py-3 rounded-t-3xl transition-all duration-500 ease-in-out ${
            category === "wins"
              ? "bg-card border-t border-l border-r border-border text-foreground opacity-100 translate-y-0"
              : "text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
          }`}
        >
          <Target className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
          <span className="text-xs font-medium">Wins</span>
        </button>

        <button
          onClick={() => onCategoryChange?.("winstreak")}
          className={`flex flex-col items-center gap-1 w-28 py-3 rounded-t-3xl transition-all duration-500 ease-in-out ${
            category === "winstreak"
              ? "bg-card border-t border-l border-r border-border text-foreground opacity-100 translate-y-0"
              : "text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
          }`}
        >
          <Flame className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
          <span className="text-xs font-medium">Win Streak</span>
        </button>
      </div>

      <Card className="overflow-hidden rounded-t-none border-t-0 animate-in fade-in duration-500">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>{getCategoryTitle()}</CardTitle>
              <CardDescription>
                {category === "elo" && "Players with the highest ELO rating"}
                {category === "wins" && "Players with the most practice wins"}
                {category === "winstreak" && "Players with the longest active win streaks"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchLeaderboard} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          )}
          <div className="flex items-center gap-6 pt-4 border-t border-border mt-4">
            <div className="h-[80px] w-[240px] flex-shrink-0 flex items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-4">#</span>
            </div>
            <div className="flex flex-1 items-center justify-between gap-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">PLAYER</span>
            </div>
          </div>
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
                    className={`absolute left-0 text-5xl font-black italic font-sans text-white z-10`}
                    style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}
                  >
                    {player.rank}.
                  </span>
                  <img
                    src={getAvatarUrl(player.username) || "/placeholder.svg"}
                    alt={player.username}
                    className="absolute right-14 h-[88px] w-[88px] object-contain z-10"
                    style={{ filter: "drop-shadow(-4px 0px 0.8px rgba(0, 0, 0, 0.3))" }}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=88&width=88"
                    }}
                  />
                </div>

                <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-2xl font-extrabold text-foreground">{player.username}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getBadges(player).map((badge) => (
                        <div
                          key={badge.id}
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${badge.color}`}
                          title={badge.requirement}
                        >
                          {badge.icon}
                          <span className="text-xs font-semibold">{badge.name}</span>
                        </div>
                      ))}
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
    </div>
  )
}
