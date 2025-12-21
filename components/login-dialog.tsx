"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, LogIn, Loader2 } from "lucide-react"

interface LoginDialogProps {
  onLogin: (username: string) => void
  onClose: () => void
}

export function LoginDialog({ onLogin, onClose }: LoginDialogProps) {
  const [verificationKey, setVerificationKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationKey: verificationKey.toUpperCase() }),
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data.username)
        onClose()
      } else {
        setError(data.error || "Verification failed")
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
          <h2 className="text-2xl font-bold">Verify Your Account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the <span className="font-mono font-medium text-foreground">/verify</span> command in-game to get your
            code
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="key" className="mb-2 block text-sm font-medium">
              Verification Code
            </label>
            <Input
              id="key"
              type="text"
              placeholder="ABC123"
              value={verificationKey}
              onChange={(e) => setVerificationKey(e.target.value.toUpperCase())}
              required
              maxLength={6}
              disabled={isLoading}
              className="font-mono text-lg uppercase tracking-wider"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Verify Account
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 rounded-lg border border-border bg-secondary/50 p-4">
          <p className="text-sm font-medium">How to get your code:</p>
          <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>1. Join the Minecraft server</li>
            <li>
              2. Type <span className="font-mono text-foreground">/verify</span> in chat
            </li>
            <li>3. Copy your 6-character code</li>
            <li>4. Paste it here - that's it!</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
