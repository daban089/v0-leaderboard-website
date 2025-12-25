"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"

interface AdminPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [allowedUsers, setAllowedUsers] = useState<string[]>([])
  const [newUsername, setNewUsername] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchAllowedUsers()
    }
  }, [isOpen])

  const fetchAllowedUsers = async () => {
    try {
      const response = await fetch("/api/admin/allowed-users")
      const data = await response.json()
      setAllowedUsers(data.users || [])
    } catch (error) {
      console.error("Failed to fetch allowed users:", error)
    }
  }

  const addUser = async () => {
    if (!newUsername.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/admin/allowed-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername.trim() }),
      })

      if (response.ok) {
        setNewUsername("")
        fetchAllowedUsers()
      } else {
        alert("Failed to add user")
      }
    } catch (error) {
      console.error("Error adding user:", error)
      alert("Error adding user")
    } finally {
      setLoading(false)
    }
  }

  const removeUser = async (username: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/allowed-users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      })

      if (response.ok) {
        fetchAllowedUsers()
      } else {
        alert("Failed to remove user")
      }
    } catch (error) {
      console.error("Error removing user:", error)
      alert("Error removing user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Custom Namecard Access</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New User */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addUser()
              }}
            />
            <Button onClick={addUser} disabled={loading || !newUsername.trim()}>
              Add
            </Button>
          </div>

          {/* Allowed Users List */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Allowed Users</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {allowedUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users allowed yet</p>
              ) : (
                allowedUsers.map((user) => (
                  <Card key={user} className="flex items-center justify-between p-3">
                    <span className="text-sm font-medium">{user}</span>
                    <button
                      onClick={() => removeUser(user)}
                      disabled={loading}
                      className="text-destructive hover:text-destructive/80 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
