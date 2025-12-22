"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Trophy } from "lucide-react"

interface PlayerModalProps {
  isOpen: boolean
  onClose: () => void
  player: {
    username: string
    elo: number
    wins: number
    losses: number
    rank: number
    winStreak: number
    swordElo?: number
    axeElo?: number
    sumoElo?: number
    maceElo?: number
  }
}

interface Badge {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  requirement: string
}

const getBadges = (player: PlayerModalProps["player"]): Badge[] => {
  const badges: Badge[] = []

  if (player.elo >= 1800) {
    badges.push({
      id: "master",
      name: "Master",
      icon: <Trophy className="h-4 w-4" />,
      color: "bg-purple-500/20 text-purple-400 border-purple-500/50",
      requirement: "1800+ ELO",
    })
  } else if (player.elo >= 1600) {
    badges.push({
      id: "diamond",
      name: "Diamond",
      icon: <Trophy className="h-4 w-4" />,
      color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
      requirement: "1600+ ELO",
    })
  } else if (player.elo >= 1400) {
    badges.push({
      id: "gold",
      name: "Gold",
      icon: <Trophy className="h-4 w-4" />,
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      requirement: "1400+ ELO",
    })
  } else if (player.elo >= 1200) {
    badges.push({
      id: "silver",
      name: "Silver",
      icon: <Trophy className="h-4 w-4" />,
      color: "bg-gray-400/20 text-gray-300 border-gray-400/50",
      requirement: "1200+ ELO",
    })
  } else if (player.elo >= 1000) {
    badges.push({
      id: "bronze",
      name: "Bronze",
      icon: <Trophy className="h-4 w-4" />,
      color: "bg-orange-600/20 text-orange-400 border-orange-600/50",
      requirement: "1000+ ELO",
    })
  }

  if (player.winStreak >= 10) {
    badges.push({
      id: "unstoppable",
      name: "Unstoppable",
      icon: <Trophy className="h-4 w-4" />,
      color: "bg-red-500/20 text-red-400 border-red-500/50",
      requirement: "10+ win streak",
    })
  } else if (player.winStreak >= 5) {
    badges.push({
      id: "onfire",
      name: "On Fire",
      icon: <Trophy className="h-4 w-4" />,
      color: "bg-orange-500/20 text-orange-400 border-orange-500/50",
      requirement: "5+ win streak",
    })
  }

  return badges
}

export function PlayerModal({ isOpen, onClose, player }: PlayerModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  const gamemodes = [
    { name: "Sword", icon: "/images/diamond-sword.png", elo: player.swordElo || player.elo },
    { name: "Axe", icon: "/images/diamond-axe.png", elo: player.axeElo || player.elo },
    { name: "Sumo", icon: "/images/lead.png", elo: player.sumoElo || player.elo },
    { name: "Mace", icon: "/images/mace.png", elo: player.maceElo || player.elo },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full p-2 hover:bg-muted transition-colors"
          aria-label="Close modal"
        >
          <X className="h-6 w-6 text-muted-foreground hover:text-foreground" />
        </button>

        <div className="p-8">
          {/* 3D Skin Render */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-64 h-64 rounded-full overflow-hidden bg-muted/20 border-4 border-border mb-4">
              <iframe
                ref={iframeRef}
                src={`https://visage.surgeplay.com/full/512/${player.username}`}
                className="w-full h-full scale-150"
                style={{
                  border: "none",
                  animation: "slowRotate 20s linear infinite",
                }}
                title={`${player.username} skin`}
              />
            </div>
            <h2 className="text-3xl font-bold text-foreground">{player.username}</h2>
            <p className="text-muted-foreground">Rank #{player.rank}</p>
          </div>

          {/* Badges Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Badges</h3>
            <div className="flex flex-wrap gap-3">
              {getBadges(player).map((badge) => (
                <div
                  key={badge.id}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 ${badge.color}`}
                  title={badge.requirement}
                >
                  {badge.icon}
                  <span className="text-sm font-semibold">{badge.name}</span>
                </div>
              ))}
              {getBadges(player).length === 0 && <p className="text-muted-foreground text-sm">No badges earned yet</p>}
            </div>
          </div>

          {/* Gamemode ELOs */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Gamemode ELOs</h3>
            <div className="grid grid-cols-4 gap-4">
              {gamemodes.map((mode) => (
                <div
                  key={mode.name}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl bg-muted/20 border border-border hover:border-primary/50 transition-colors"
                >
                  <img src={mode.icon || "/placeholder.svg"} alt={mode.name} className="h-12 w-12 object-contain" />
                  <span className="text-sm font-medium text-muted-foreground">{mode.name}</span>
                  <span className="text-2xl font-bold text-white">{mode.elo}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex justify-around text-center">
              <div>
                <p className="text-sm text-muted-foreground">Wins</p>
                <p className="text-2xl font-bold text-green-500">{player.wins}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Losses</p>
                <p className="text-2xl font-bold text-red-500">{player.losses}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall ELO</p>
                <p className="text-2xl font-bold text-white">{player.elo}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slowRotate {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }
      `}</style>
    </div>
  )
}
