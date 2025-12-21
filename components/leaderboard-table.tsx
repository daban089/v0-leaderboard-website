"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Crown, Medal, Target, TrendingUp, Flame } from "lucide-react"

interface Player {
  rank: number
  username: string
  elo: number
  wins: number
  losses: number
  winRate: number
  winStreak: number
  totalMatches: number
}

interface LeaderboardTableProps {
  kit?: string
  searchQuery?: string
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

  // ELO tier badges
  if (player.elo >= 1800) {
    badges.push({
      id: "master",
      name: "Master",
      icon: <Crown className="h-3 w-3" />,
      color: "bg-purple-500/20 text-purple-400 border-purple-500/50",
      requirement: "1800+ ELO",
    })
  } else if (player.elo >= 1600) {
    badges.push({
      id: "diamond",
      name: "Diamond",
      icon: <Trophy className="h-3 w-3" />,
      color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
      requirement: "1600+ ELO",
    })
  } else if (player.elo >= 1400) {
    badges.push({
      id: "gold",
      name: "Gold",
      icon: <Medal className="h-3 w-3" />,
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      requirement: "1400+ ELO",
    })
  } else if (player.elo >= 1200) {
    badges.push({
      id: "silver",
      name: "Silver",
      icon: <Target className="h-3 w-3" />,
      color: "bg-gray-400/20 text-gray-300 border-gray-400/50",
      requirement: "1200+ ELO",
    })
  } else if (player.elo >= 1000) {
    badges.push({
      id: "bronze",
      name: "Bronze",
      icon: <TrendingUp className="h-3 w-3" />,
      color: "bg-orange-600/20 text-orange-400 border-orange-600/50",
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
      icon: <Flame className="h-3 w-3" />,
      color: "bg-orange-500/20 text-orange-400 border-orange-500/50",
      requirement: "5+ win streak",
    })
  }

  return badges
}

export function LeaderboardTable({
  kit = "all",
  searchQuery: externalSearchQuery,
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
      const response = await fetch(`/api/leaderboard?kit=${kit}`)
      const data = await response.json()
      if (Array.isArray(data)) {
        setPlayers(data)
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
  }, [kit])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard()
    }, 60000)

    return () => clearInterval(interval)
  }, [kit])

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
    if (kit === "all") return `${player.elo} ELO`
    return `${player.wins}W - ${player.losses}L`
  }

  const getCategoryTitle = () => {
    return "Strike Practice Leaderboard"
  }

  const getShimmerUrl = (rank: number) => {
    if (rank === 1) return "/shimmer.svg"
    if (rank === 2) return "/shimmer-silver.svg"
    if (rank === 3) return "/shimmer-bronze.svg"
    if (rank > 3) return "/images/other.png"
    return null
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
        <button
          onClick={() => onKitChange?.("all")}
          className={`flex flex-col items-center gap-1 w-28 py-3 rounded-t-3xl transition-all duration-500 ease-in-out bg-card border-t border-l border-r border-border ${
            kit === "all"
              ? "text-white opacity-100"
              : "text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
          }`}
        >
          <Trophy className="h-5 w-5" />
          <span className="text-xs font-medium">Overall</span>
        </button>

        <button
          onClick={() => onKitChange?.("sword")}
          className={`flex flex-col items-center gap-1 w-28 py-3 rounded-t-3xl transition-all duration-500 ease-in-out bg-card border-t border-l border-r border-border ${
            kit === "sword"
              ? "text-white opacity-100"
              : "text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
          }`}
        >
          <Target className="h-5 w-5" />
          <span className="text-xs font-medium">Sword</span>
        </button>

        <button
          onClick={() => onKitChange?.("axe")}
          className={`flex flex-col items-center gap-1 w-28 py-3 rounded-t-3xl transition-all duration-500 ease-in-out bg-card border-t border-l border-r border-border ${
            kit === "axe"
              ? "text-white opacity-100"
              : "text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
          }`}
        >
          <Flame className="h-5 w-5" />
          <span className="text-xs font-medium">Axe</span>
        </button>

        <button
          onClick={() => onKitChange?.("sumo")}
          className={`flex flex-col items-center gap-1 w-28 py-3 rounded-t-3xl transition-all duration-500 ease-in-out bg-card border-t border-l border-r border-border ${
            kit === "sumo"
              ? "text-white opacity-100"
              : "text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
          }`}
        >
          <TrendingUp className="h-5 w-5" />
          <span className="text-xs font-medium">Sumo</span>
        </button>
      </div>

      <Card className="overflow-hidden rounded-t-none border-t-0">
        <CardHeader className="p-0 h-8">
          <div className="flex items-center gap-6 px-4 h-full">
            <div className="h-full w-[240px] flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-muted-foreground uppercase tracking-wider ml-4 leading-none">
                #
              </span>
            </div>
            <div className="flex flex-1 items-center justify-between gap-4">
              <span className="text-xl font-bold text-muted-foreground uppercase tracking-wider leading-none">
                PLAYER
              </span>
              <span className="text-xl font-bold text-muted-foreground uppercase tracking-wider leading-none">
                STATS
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <div className="space-y-4">
            {filteredPlayers.map((player) => (
              <div
                key={player.username}
                className="relative flex items-center gap-6 rounded-xl border border-border overflow-hidden p-4 transition-all hover:scale-[1.01] hover:shadow-lg"
                style={
                  player.rank <= 3 || player.rank > 3
                    ? {
                        backgroundImage: `url('${getShimmerUrl(player.rank)}')`,
                        backgroundSize: "240px 80px",
                        backgroundPosition: "left center",
                        backgroundRepeat: "no-repeat",
                      }
                    : undefined
                }
              >
                <div className="relative h-[80px] w-[240px] flex-shrink-0 flex items-center overflow-hidden">
                  <span
                    className="absolute left-0 text-5xl font-black italic font-sans text-white z-10"
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

                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-primary">{player.elo}</span>
                      <span className="text-sm text-muted-foreground">ELO</span>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <span className="text-green-500 font-semibold">{player.wins}W</span>
                      <span className="text-red-500 font-semibold">{player.losses}L</span>
                      <span className="text-muted-foreground">({player.winRate}%)</span>
                    </div>
                    {player.winStreak > 0 && (
                      <div className="flex items-center gap-1 text-orange-500">
                        <Flame className="h-3 w-3" />
                        <span className="text-xs font-semibold">{player.winStreak} streak</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredPlayers.length === 0 && !loading && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No players found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
