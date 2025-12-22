"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"

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
  }
  gamemodeElos?: {
    sword: number
    axe: number
    sumo: number
    mace: number
  }
}

interface Badge {
  id: string
  name: string
  icon: string // Changed to string URL for image source
  color: string
  requirement: string
}

const getBadges = (player: PlayerModalProps["player"]): Badge[] => {
  const badges: Badge[] = []

  if (player.elo >= 2500) {
    badges.push({
      id: "grandmaster",
      name: "Combat Grandmaster",
      icon: "/images/combat-grandmaster.webp",
      color: "text-gray-400",
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

  // Win streak badges - removed as per user request

  return badges
}

export function PlayerModal({ isOpen, onClose, player, gamemodeElos }: PlayerModalProps) {
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
    { name: "Sword", icon: "/images/diamond-sword.png", elo: gamemodeElos?.sword || player.elo },
    { name: "Axe", icon: "/images/diamond-axe.png", elo: gamemodeElos?.axe || player.elo },
    { name: "Sumo", icon: "/images/lead.png", elo: gamemodeElos?.sumo || player.elo },
    { name: "Mace", icon: "/images/mace.png", elo: gamemodeElos?.mace || player.elo },
  ]

  const getAvatarUrl = (username: string) => {
    return `/api/avatar-proxy?username=${encodeURIComponent(username)}`
  }

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
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-48 h-48 flex items-center justify-center mb-4 rounded-full overflow-hidden bg-muted/20 border-4 border-border">
              <img
                src={getAvatarUrl(player.username) || "/placeholder.svg"}
                alt={player.username}
                className="w-full h-full object-contain"
                style={{
                  imageRendering: "pixelated",
                }}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=192&width=192"
                }}
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
                <div key={badge.id} className={`flex items-center gap-2 ${badge.color}`} title={badge.requirement}>
                  <img src={badge.icon || "/placeholder.svg"} alt={badge.name} className="h-8 w-8" />
                  <span className="text-base font-medium">{badge.name}</span>
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
                  <span className="text-sm text-muted-foreground">{mode.name}</span>
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
    </div>
  )
}
