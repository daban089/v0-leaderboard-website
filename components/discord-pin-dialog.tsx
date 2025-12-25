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
  const [needsDiscordLink, setNeedsDiscordLink] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setNeedsDiscordLink(false)
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
        if (data.error?.includes("discord link") || data.error?.includes("/discord link")) {
          setNeedsDiscordLink(true)
        }
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
          <h2 className="text-2xl font-bold">Verify Account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use the 4-digit PIN from /verify in-game</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pin" className="mb-2 block text-sm font-medium">
              Verification PIN
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

          {needsDiscordLink ? (
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-sm">
              <p className="font-medium text-amber-500">Discord Not Linked</p>
              <p className="mt-2 text-muted-foreground">You need to link your Discord account first:</p>
              <ol className="mt-2 space-y-1 text-muted-foreground">
                <li>
                  1. Type <code className="rounded bg-secondary px-1">/discord link</code> in-game
                </li>
                <li>2. Message the bot on Discord with your code</li>
                <li>3. Come back here and try again</li>
              </ol>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={isLoading || pin.length !== 4}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Account"
            )}
          </Button>
        </form>

        <div className="mt-6 rounded-lg border border-border bg-secondary/50 p-4">
          <p className="text-sm font-medium">How to get your PIN:</p>
          <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>
              1. Type <code className="rounded bg-secondary/80 px-1">/verify</code> in the Minecraft server
            </li>
            <li>2. You'll receive a 4-digit PIN</li>
            <li>3. Enter it here to verify your account</li>
          </ol>
          <p className="mt-3 text-xs text-muted-foreground">
            Note: You must have your Discord linked via{" "}
            <code className="rounded bg-secondary/80 px-1">/discord link</code> first.
          </p>
        </div>
      </div>
    </div>
  )
}
