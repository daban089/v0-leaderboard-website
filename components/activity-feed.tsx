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
    async function fetchMatches() {
      try {
        const response = await fetch("/api/recent-matches")
        if (response.ok) {
          const data = await response.json()
          setMatches(data.matches || [])
        }
      } catch (error) {
        console.error("Failed to fetch matches:", error)
      }
    }

    fetchMatches()
  }, [])

  return (
    <Card className="relative overflow-hidden border-red-950/50 bg-card/80 backdrop-blur-sm">
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-red-950/20 via-transparent to-red-950/20 opacity-50" />

      {/* Header */}
      <div className="relative border-b border-red-950/50 bg-red-950/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Recent Matches</h2>
        </div>
      </div>

      {/* Match list */}
      <div className="relative max-h-[600px] overflow-y-auto">
        {matches.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">No recent matches found</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {matches.map((match) => (
              <div key={match.id} className="px-6 py-4 transition-colors hover:bg-red-950/10">
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
        )}
      </div>
    </Card>
  )
}
