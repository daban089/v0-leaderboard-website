"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import Image from "next/image"
import { PlayerModal } from "./player-modal"

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
}

interface Badge {
  id: string
  name: string
  icon: string // Changed to string URL for image source
  color: string
  requirement: string
}

type KitType = "all" | "sword" | "axe" | "sumo" | "mace" | "crystalpvp"

const getBadges = (player: Player): Badge[] => {
  const badges: Badge[] = []

  if (player.elo >= 2500) {
    badges.push({
      id: "grandmaster",
      name: "Combat Grandmaster",
      icon: "/images/combat-grandmaster.webp",
      color: "text-gray-400", // Changed to light gray text, removed background
      requirement: "2500+ ELO",
    })
  } else if (player.elo >= 2200) {
    badges.push({
      id: "master",
      name: "Combat Master",
      icon: "/images/combat-master.webp",
      color: "text-gray-400",
      requirement: "2200+ ELO",
    })
  } else if (player.elo >= 2000) {
    badges.push({
      id: "ace",
      name: "Combat Ace",
      icon: "/images/combat-ace.svg",
      color: "text-gray-400",
      requirement: "2000+ ELO",
    })
  } else if (player.elo >= 1800) {
    badges.push({
      id: "specialist",
      name: "Combat Specialist",
      icon: "/images/combat-specialist.svg",
      color: "text-gray-400",
      requirement: "1800+ ELO",
    })
  } else if (player.elo >= 1500) {
    badges.push({
      id: "cadet",
      name: "Combat Cadet",
      icon: "/images/combat-cadet.svg",
      color: "text-gray-400",
      requirement: "1500+ ELO",
    })
  } else if (player.elo >= 1300) {
    badges.push({
      id: "novice",
      name: "Combat Novice",
      icon: "/images/combat-novice.svg",
      color: "text-gray-400",
      requirement: "1300+ ELO",
    })
  } else {
    badges.push({
      id: "rookie",
      name: "Combat Rookie",
      icon: "/images/rookie.svg",
      color: "text-gray-400",
      requirement: "<1300 ELO",
    })
  }

  return badges
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ kit = "all" }) => {
  const [selectedKit, setSelectedKit] = useState<KitType>(kit as KitType)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [gamemodeElos, setGamemodeElos] = useState<Record<string, number> | null>(null)
  const [mode, setMode] = useState<"high-tiers" | "ranked">("ranked")
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const fetchLeaderboard = async (kit: KitType) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/leaderboard?kit=${kit}`)

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard data")
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        setPlayers(data)
      } else {
        setPlayers([])
      }
    } catch (err) {
      console.error("[v0] Error fetching leaderboard:", err)
      setError("Failed to load leaderboard. Please try again later.")
      setPlayers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard(selectedKit)
  }, [selectedKit])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard(selectedKit)
    }, 60000)

    return () => clearInterval(interval)
  }, [selectedKit])

  useEffect(() => {
    const kitOrder: KitType[] = ["all", "sword", "axe", "sumo", "mace", "crystalpvp"]
    setActiveTabIndex(kitOrder.indexOf(selectedKit))
  }, [selectedKit])

  const filteredPlayers = players.filter((player) => player.username.toLowerCase().includes(""))

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
    if (rank === 1) return <Trophy className="h-4 w-4" />
    if (rank === 2) return <Trophy className="h-4 w-4" />
    if (rank === 3) return <Trophy className="h-4 w-4" />
    return null
  }

  const getAvatarUrl = (username: string) => {
    return `/api/avatar-proxy?username=${encodeURIComponent(username)}`
  }

  const getStatValue = (player: Player) => {
    if (selectedKit === "all") return `${player.elo} ELO`
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

  const getKitIcon = (kitName: KitType) => {
    if (kitName === "all") return <Trophy className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
    if (kitName === "sword")
      return (
        <Image
          src="/images/diamond-sword.png"
          alt="Sword"
          width={64}
          height={64}
          className="h-8 w-8 object-contain transition-transform duration-300 hover:scale-110"
        />
      )
    if (kitName === "axe")
      return (
        <Image
          src="/images/diamond-axe.png"
          alt="Axe"
          width={64}
          height={64}
          className="h-8 w-8 object-contain transition-transform duration-300 hover:scale-110"
        />
      )
    if (kitName === "sumo")
      return (
        <Image
          src="/images/lead.png"
          alt="Lead"
          width={64}
          height={64}
          className="h-8 w-8 object-contain transition-transform duration-300 hover:scale-110"
        />
      )
    if (kitName === "mace")
      return (
        <Image
          src="/images/mace.png"
          alt="Mace"
          width={64}
          height={64}
          className="h-8 w-8 object-contain transition-transform duration-300 hover:scale-110"
        />
      )
    if (kitName === "crystalpvp")
      return (
        <Image
          src="/images/end-crystal.png"
          alt="Crystal"
          width={64}
          height={64}
          className="h-8 w-8 object-contain transition-transform duration-300 hover:scale-110"
          style={{ imageRendering: "pixelated" }}
        />
      )
    return <Trophy className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
  }

  const getKitDisplayName = (kitName: KitType) => {
    if (kitName === "all") return "Overall"
    return kitName.charAt(0).toUpperCase() + kitName.slice(1)
  }

  const handlePlayerClick = async (player: Player) => {
    if (selectedKit !== "all") return

    setSelectedPlayer(player)
    setIsModalOpen(true)

    try {
      const response = await fetch(`/api/player-details?username=${encodeURIComponent(player.username)}`)
      const data = await response.json()
      if (data.gamemodeElos) {
        setGamemodeElos(data.gamemodeElos)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch player details:", error)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setGamemodeElos(null)
    setTimeout(() => setSelectedPlayer(null), 200)
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getCategoryTitle()}</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => {
            console.log("[v0] Switching to High Tiers mode")
            setMode("high-tiers")
            setSelectedKit("all")
          }}
          className={`relative flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all duration-300 overflow-hidden ${
            mode === "high-tiers"
              ? "bg-gradient-to-r from-red-950/90 via-red-900/90 to-red-950/90 text-red-100 shadow-lg shadow-red-900/70 border border-red-800/60 backdrop-blur-xl crimson-glow"
              : "bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border"
          }`}
        >
          {mode === "high-tiers" && (
            <div className="absolute inset-0 bg-gradient-to-br from-red-800/20 via-transparent to-transparent pointer-events-none" />
          )}
          <Image
            src="/images/fire-focus-icon.png"
            alt="High Tiers"
            width={64}
            height={64}
            className="h-10 w-10 relative z-10 pixelated"
            onError={() => console.log("[v0] Failed to load fire-focus-icon")}
          />
          <span className="relative z-10">High Tiers</span>
        </button>

        <button
          onClick={() => {
            console.log("[v0] Switching to Ranked mode")
            setMode("ranked")
            setSelectedKit("all")
          }}
          className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
            mode === "ranked"
              ? "bg-card text-foreground border-2 border-primary"
              : "bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border"
          }`}
        >
          <Image
            src="/images/soul-focus-icon.png"
            alt="Ranked"
            width={64}
            height={64}
            className="h-10 w-10 pixelated"
            onError={() => console.log("[v0] Failed to load soul-focus-icon")}
          />
          <span>Ranked</span>
        </button>
      </div>

      {mode === "ranked" && (
        <div className="flex items-end">
          <button
            onClick={() => setSelectedKit("all")}
            className={`flex flex-col items-center gap-1 w-28 py-3 rounded-t-3xl transition-all duration-500 ease-in-out bg-card border-t border-l border-r ${
              selectedKit === "all"
                ? "text-white opacity-100 border-[#ff3b30]"
                : "text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 border-border"
            }`}
          >
            <Trophy className="h-8 w-8" />
            <span className="text-xs font-medium">Overall</span>
          </button>

          <button
            onClick={() => setSelectedKit("sword")}
            className={`flex flex-col items-center gap-1 w-28 py-3 rounded-t-3xl transition-all duration-500 ease-in-out bg-card border-t border-l border-r ${
              selectedKit === "sword"
                ? "text-white opacity-100 border-[#ff3b30]"
                : "text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 border-border"
            }`}
          >
            <Image
              src="/images/diamond-sword.png"
              alt="Sword"
              width={64}
              height={64}
              className="h-8 w-8 object-contain"
            />
            <span className="text-xs font-medium">Sword</span>
          </button>

          <button
            onClick={() => setSelectedKit("axe")}
            className={`flex flex-col items-center gap-1 w-28 py-3 rounded-t-3xl transition-all duration-500 ease-in-out bg-card border-t border-l border-r ${
              selectedKit === "axe"
                ? "text-white opacity-100 border-[#ff3b30]"
                : "text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 border-border"
            }`}
          >
            <Image src="/images/diamond-axe.png" alt="Axe" width={64} height={64} className="h-8 w-8 object-contain" />
            <span className="text-xs font-medium">Axe</span>
          </button>

          <button
            onClick={() => setSelectedKit("sumo")}
            className={`flex flex-col items-center gap-1 w-28 py-3 rounded-t-3xl transition-all duration-500 ease-in-out bg-card border-t border-l border-r ${
              selectedKit === "sumo"
                ? "text-white opacity-100 border-[#ff3b30]"
                : "text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 border-border"
            }`}
          >
            <Image src="/images/lead.png" alt="Lead" width={64} height={64} className="h-8 w-8 object-contain" />
            <span className="text-xs font-medium">Sumo</span>
          </button>

          <button
            onClick={() => setSelectedKit("mace")}
            className={`flex flex-col items-center gap-1 w-28 py-3 rounded-t-3xl transition-all duration-500 ease-in-out bg-card border-t border-l border-r ${
              selectedKit === "mace"
                ? "text-white opacity-100 border-[#ff3b30]"
                : "text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 border-border"
            }`}
          >
            <Image src="/images/mace.png" alt="Mace" width={64} height={64} className="h-8 w-8 object-contain" />
            <span className="text-xs font-medium">Mace</span>
          </button>

          <button
            onClick={() => setSelectedKit("crystalpvp")}
            className={`flex flex-col items-center gap-1 w-28 py-3 rounded-t-3xl transition-all duration-500 ease-in-out bg-card border-t border-l border-r ${
              selectedKit === "crystalpvp"
                ? "text-white opacity-100 border-[#ff3b30]"
                : "text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 border-border"
            }`}
          >
            <Image
              src="/images/end-crystal.png"
              alt="Crystal"
              width={64}
              height={64}
              className="h-8 w-8 object-contain"
              style={{ imageRendering: "pixelated" }}
            />
            <span className="text-xs font-medium">Crystal</span>
          </button>
        </div>
      )}

      {mode === "high-tiers" ? (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-3xl font-black bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
              High Tiers
            </CardTitle>
            <CardDescription>Manually curated top players tested by staff</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-muted-foreground">High Tiers content coming soon...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <div
            className="absolute top-0 left-0 h-[1px] bg-[#ff3b30] transition-all duration-500"
            style={{ width: `${activeTabIndex * 112}px` }}
          />
          <div
            className="absolute top-0 right-0 h-[1px] bg-[#ff3b30] transition-all duration-500"
            style={{ width: `calc(100% - ${(activeTabIndex + 1) * 112}px)` }}
          />
          <Card className="overflow-hidden rounded-t-none border-t-0 border-[#ff3b30]">
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
                    key={`${player.username}-${player.rank}`}
                    className={`relative flex items-center gap-6 rounded-xl border overflow-hidden p-4 select-none transition-all duration-300 ${
                      player.username.toLowerCase() === "bafr"
                        ? "border-border cursor-pointer hover:scale-[1.02] hover:shadow-xl"
                        : player.rank === 1
                          ? "border-yellow-500/80 shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:scale-[1.02] animate-glow-pulse cursor-pointer"
                          : player.rank === 2
                            ? "border-gray-400/80 shadow-[0_0_20px_rgba(156,163,175,0.3)] hover:shadow-[0_0_30px_rgba(156,163,175,0.4)] hover:scale-[1.02] animate-silver-glow-pulse cursor-pointer"
                            : player.rank === 3
                              ? "border-orange-500/80 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:scale-[1.02] animate-bronze-glow-pulse cursor-pointer"
                              : selectedKit === "all"
                                ? "border-border cursor-pointer hover:scale-[1.02] hover:shadow-xl"
                                : "border-border hover:translate-x-1 hover:shadow-md"
                    }`}
                    onClick={() => handlePlayerClick(player)}
                  >
                    <div
                      className="absolute inset-0 z-[1] pointer-events-none"
                      style={{
                        backgroundImage: `url('${getShimmerUrl(player.rank)}')`,
                        backgroundSize: "240px 100px",
                        backgroundPosition: "left center",
                        backgroundRepeat: "no-repeat",
                        opacity: 1,
                      }}
                    />

                    {player.username.toLowerCase() === "bafr" && (
                      <div
                        className="absolute inset-0 z-0 pointer-events-none"
                        style={{
                          backgroundImage: "url('/bafr-custom-bg.gif')",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                          opacity: 0.75,
                        }}
                      />
                    )}

                    {player.username.toLowerCase() !== "bafr" && player.rank === 1 && (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={`fire-${i}`}
                            className="absolute animate-fire-rise"
                            style={{
                              left: `${5 + Math.random() * 90}%`,
                              bottom: `${-10}px`,
                              animationDelay: `${Math.random() * 3}s`,
                              animationDuration: `${3 + Math.random() * 2}s`,
                            }}
                          >
                            <div className="fire-particle" />
                          </div>
                        ))}
                      </div>
                    )}

                    {player.username.toLowerCase() !== "bafr" && player.rank === 2 && (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={`silver-${i}`}
                            className="absolute animate-silver-rise"
                            style={{
                              left: `${5 + Math.random() * 90}%`,
                              bottom: `${-10}px`,
                              animationDelay: `${Math.random() * 3}s`,
                              animationDuration: `${3 + Math.random() * 2}s`,
                            }}
                          >
                            <div className="silver-particle" />
                          </div>
                        ))}
                      </div>
                    )}

                    {player.username.toLowerCase() !== "bafr" && player.rank === 3 && (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={`bronze-${i}`}
                            className="absolute animate-bronze-rise"
                            style={{
                              left: `${5 + Math.random() * 90}%`,
                              bottom: `${-10}px`,
                              animationDelay: `${Math.random() * 3}s`,
                              animationDuration: `${3 + Math.random() * 2}s`,
                            }}
                          >
                            <div className="bronze-particle" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="relative h-[100px] w-[240px] flex-shrink-0 flex items-center overflow-hidden z-10">
                      <span
                        className="absolute left-0 text-5xl font-black italic font-sans text-white z-10"
                        style={{
                          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                        }}
                      >
                        {player.rank}.
                      </span>
                      <img
                        src={getAvatarUrl(player.username) || "/placeholder.svg"}
                        alt={player.username}
                        className="absolute right-14 h-[88px] w-[88px] object-contain z-10 scale-105"
                        style={{
                          filter: "drop-shadow(-4px 0px 0.8px rgba(0,0,0,0.3))",
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=88&width=88"
                        }}
                      />
                    </div>

                    <div className="flex flex-1 items-center justify-between gap-4 min-w-0 relative z-10">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-2xl font-extrabold text-foreground">
                          <span
                            className={`${
                              player.username.toLowerCase() === "bafr"
                                ? "bg-black/50 px-3 py-1 rounded-full inline-block"
                                : ""
                            }`}
                          >
                            {player.username}
                          </span>
                        </p>
                        <div className="space-y-2">
                          {selectedKit === "all" && (
                            <div className="flex flex-wrap gap-2">
                              {getBadges(player).map((badge) => (
                                <div
                                  key={badge.id}
                                  className={`flex items-center gap-2 ${badge.color} ${
                                    player.username.toLowerCase() === "bafr" ? "bg-black/50 px-2 py-1 rounded-full" : ""
                                  }`}
                                  title={badge.requirement}
                                >
                                  <img src={badge.icon || "/placeholder.svg"} alt={badge.name} className="h-6 w-6" />
                                  <span className="text-sm font-medium">{badge.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        <div
                          className={`flex items-center gap-2 ${
                            player.username.toLowerCase() === "bafr" ? "bg-black/50 px-3 py-0.5 rounded-md" : ""
                          }`}
                        >
                          <span className="text-3xl font-black text-white">{player.elo}</span>
                          <span className="text-sm text-muted-foreground">ELO</span>
                        </div>
                        <div className="flex gap-3 text-sm">
                          <span
                            className={`text-green-400 ${
                              player.username.toLowerCase() === "bafr"
                                ? "bg-black/50 px-2 py-0.5 rounded-md inline-block"
                                : ""
                            }`}
                          >
                            {player.wins}W
                          </span>
                          <span
                            className={`text-red-400 ${
                              player.username.toLowerCase() === "bafr"
                                ? "bg-black/50 px-2 py-0.5 rounded-md inline-block"
                                : ""
                            }`}
                          >
                            {player.losses}L
                          </span>
                        </div>
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
      )}

      {selectedPlayer && (
        <PlayerModal
          isOpen={isModalOpen}
          onClose={closeModal}
          player={{
            username: selectedPlayer.username,
            elo: selectedPlayer.elo,
            wins: selectedPlayer.wins,
            losses: selectedPlayer.losses,
            rank: selectedPlayer.rank,
            winStreak: selectedPlayer.winStreak,
          }}
          gamemodeElos={gamemodeElos || undefined}
        />
      )}
    </div>
  )
}

export default LeaderboardTable
export { LeaderboardTable }
