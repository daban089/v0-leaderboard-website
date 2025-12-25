"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Loader2 } from "lucide-react"

interface DiscordPinDialogProps {
  onLogin: (username: string) => void
  onClose: () => void
}

export function DiscordPinDialog({ onLogin, onClose }: DiscordPinDialogProps) {
  const [pin, setPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/verify-discord-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pin.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data.username)
        onClose()
      } else {
        setError(data.error || "PIN verification failed")
      }
    } catch (err) {
      setError("Failed to connect to server")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold">Link with Discord</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use the 4-digit PIN from DiscordSRV linking</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pin" className="mb-2 block text-sm font-medium">
              Discord PIN
            </label>
            <Input
              id="pin"
              type="text"
              placeholder="0000"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              required
              maxLength={4}
              disabled={isLoading}
              className="font-mono text-2xl text-center tracking-widest"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || pin.length !== 4}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Link Account"
            )}
          </Button>
        </form>

        <div className="mt-6 rounded-lg border border-border bg-secondary/50 p-4">
          <p className="text-sm font-medium">How to get your PIN:</p>
          <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>1. Link your Discord in the Minecraft server</li>
            <li>2. DiscordSRV will give you a 4-digit PIN</li>
            <li>3. Paste it here to link your account</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
