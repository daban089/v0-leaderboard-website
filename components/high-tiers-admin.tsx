"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus } from "lucide-react"

interface HighTierPlayer {
  rank: number
  username: string
}

export function HighTiersAdmin() {
  const [players, setPlayers] = useState<HighTierPlayer[]>([])
  const [newRank, setNewRank] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/high-tiers")
      const data = await response.json()
      setPlayers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("[v0] Failed to fetch high tiers:", error)
      setPlayers([])
    } finally {
      setLoading(false)
    }
  }

  const addPlayer = async () => {
    if (!newRank || !newUsername) return

    try {
      setSaving(true)
      const response = await fetch("/api/high-tiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rank: Number.parseInt(newRank), username: newUsername }),
      })

      if (response.ok) {
        setNewRank("")
        setNewUsername("")
        await fetchPlayers()
      }
    } catch (error) {
      console.error("[v0] Failed to add player:", error)
    } finally {
      setSaving(false)
    }
  }

  const deletePlayer = async (username: string) => {
    try {
      const response = await fetch(`/api/high-tiers?username=${encodeURIComponent(username)}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchPlayers()
      }
    } catch (error) {
      console.error("[v0] Failed to delete player:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>High Tiers Admin Panel</CardTitle>
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
        <CardTitle>High Tiers Admin Panel</CardTitle>
        <CardDescription>Manually manage the High Tiers rankings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <Input
            type="number"
            placeholder="Rank (1-10)"
            value={newRank}
            onChange={(e) => setNewRank(e.target.value)}
            className="w-32"
          />
          <Input
            type="text"
            placeholder="Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="flex-1"
          />
          <Button onClick={addPlayer} disabled={saving || !newRank || !newUsername}>
            <Plus className="h-4 w-4 mr-2" />
            Add Player
          </Button>
        </div>

        <div className="space-y-2">
          {players.map((player) => (
            <div key={player.username} className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-muted-foreground w-12">#{player.rank}</span>
                <span className="text-lg font-semibold">{player.username}</span>
              </div>
              <Button variant="destructive" size="sm" onClick={() => deletePlayer(player.username)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {players.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No players in High Tiers yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
