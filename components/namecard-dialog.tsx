"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload } from "lucide-react"

interface NamecardDialogProps {
  username: string
  onClose: () => void
}

export function NamecardDialog({ username, onClose }: NamecardDialogProps) {
  const [gifUrl, setGifUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/namecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, gifUrl }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Custom namecard saved! Refresh the page to see it on the leaderboard.")
        onClose()
      } else {
        setError(data.error || "Failed to save namecard")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Custom Namecard</DialogTitle>
          <DialogDescription>
            Upload a custom animated background for your namecard. The GIF should be in a 6:1 aspect ratio (e.g.,
            600x100px).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gifUrl">GIF URL</Label>
            <Input
              id="gifUrl"
              type="url"
              placeholder="https://example.com/your-namecard.gif"
              value={gifUrl}
              onChange={(e) => setGifUrl(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Paste the URL of your GIF. Make sure it's in 6:1 ratio for best results.
            </p>
          </div>

          {gifUrl && (
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <div className="relative w-full h-20 rounded-lg overflow-hidden">
                <img src={gifUrl || "/placeholder.svg"} alt="Namecard preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !gifUrl}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Save Namecard
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
