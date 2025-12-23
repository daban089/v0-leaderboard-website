"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import Image from "next/image"

type Match = {
  id: string
  winner: string
  loser: string
  winnerEloChange: number
  loserEloChange: number
  kit: "sword" | "axe" | "sumo" | "mace" | "crystalpvp"
  timestamp: Date
}

const KITS = {
  sword: { icon: "/images/diamond-sword.png", name: "Sword" },
  axe: { icon: "/images/diamond-axe.png", name: "Axe" },
  sumo: { icon: "/images/lead.png", name: "Sumo" },
  mace: { icon: "/images/mace.png", name: "Mace" },
  crystalpvp: { icon: "/images/end-crystal.png", name: "Crystal" },
}

const DEMO_NAMES = [
  "bafr",
  "xXShadowXx",
  "CrystalKing",
  "PvPMaster",
  "DiamondWarrior",
  "EnderDragon",
  "NetherKnight",
  "IronGolem",
  "BlazeFighter",
  "WitherSlayer",
  "CreeperHunter",
  "ZombieKiller",
  "SkeletonArcher",
  "SpiderNinja",
]

function getRandomName() {
  return DEMO_NAMES[Math.floor(Math.random() * DEMO_NAMES.length)]
}

function getRandomKit(): Match["kit"] {
  const kits: Match["kit"][] = ["sword", "axe", "sumo", "mace", "crystalpvp"]
  return kits[Math.floor(Math.random() * kits.length)]
}

function generateRandomMatch(): Match {
  const winner = getRandomName()
  let loser = getRandomName()
  while (loser === winner) {
    loser = getRandomName()
  }

  const eloChange = Math.floor(Math.random() * 21) + 10 // 10-30

  return {
    id: `${Date.now()}-${Math.random()}`,
    winner,
    loser,
    winnerEloChange: eloChange,
    loserEloChange: -eloChange,
    kit: getRandomKit(),
    timestamp: new Date(),
  }
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  if (seconds < 10) return "just now"
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function ActivityFeed() {
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    // Generate initial matches
    const initialMatches = Array.from({ length: 10 }, () => {
      const match = generateRandomMatch()
      match.timestamp = new Date(Date.now() - Math.random() * 300000) // Random time in last 5 mins
      return match
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    setMatches(initialMatches)

    // Add new match every 5-10 seconds
    const interval = setInterval(
      () => {
        setMatches((prev) => {
          const newMatch = generateRandomMatch()
          const updated = [newMatch, ...prev].slice(0, 20)
          return updated
        })
      },
      Math.random() * 5000 + 5000,
    ) // 5-10 seconds

    return () => clearInterval(interval)
  }, [])

  // Update timestamps every second
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="relative overflow-hidden border-red-950/50 bg-card/80 backdrop-blur-sm">
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-red-950/20 via-transparent to-red-950/20 opacity-50" />

      {/* Header */}
      <div className="relative border-b border-red-950/50 bg-red-950/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Recent Matches</h2>
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Live</span>
          </div>
        </div>
      </div>

      {/* Match list */}
      <div className="relative max-h-[600px] overflow-y-auto">
        <div className="divide-y divide-border/50">
          {matches.map((match, index) => (
            <div
              key={match.id}
              className="animate-in slide-in-from-top-4 fade-in px-6 py-4 transition-colors hover:bg-red-950/10"
              style={{ animationDuration: "400ms", animationFillMode: "both" }}
            >
              <div className="flex items-center justify-between gap-4">
                {/* Match info */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {/* Kit icon */}
                  <div className="relative flex-shrink-0">
                    <Image
                      src={KITS[match.kit].icon || "/placeholder.svg"}
                      alt={KITS[match.kit].name}
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>

                  {/* Players */}
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <button className="truncate font-semibold text-foreground transition-colors hover:text-red-400 hover:underline">
                      {match.winner}
                    </button>
                    <span className="flex-shrink-0 text-xs text-green-500 font-medium">+{match.winnerEloChange}</span>
                    <span className="flex-shrink-0 text-muted-foreground">defeated</span>
                    <button className="truncate font-semibold text-foreground transition-colors hover:text-red-400 hover:underline">
                      {match.loser}
                    </button>
                    <span className="flex-shrink-0 text-xs text-red-500 font-medium">{match.loserEloChange}</span>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex-shrink-0 text-xs text-muted-foreground">{getTimeAgo(match.timestamp)}</div>
              </div>

              {/* Kit badge */}
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-red-950/50 bg-red-950/20 px-2.5 py-0.5 text-xs font-medium text-red-300">
                  {KITS[match.kit].name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
