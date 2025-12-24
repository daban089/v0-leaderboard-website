"use client"

import { useState } from "react"

import type React from "react"
import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, X } from "lucide-react"

interface NamecardDialogProps {
  username: string
  onClose: () => void
  onSuccess?: () => void
}

export function NamecardDialog({ username, onClose, onSuccess }: NamecardDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasExistingNamecard, setHasExistingNamecard] = useState(false)
  const [isCheckingExisting, setIsCheckingExisting] = useState(true)

  useEffect(() => {
    const checkExistingNamecard = async () => {
      console.log("[v0] Checking existing namecard for:", username)
      setIsCheckingExisting(true)
      try {
        const response = await fetch("/api/namecard")
        console.log("[v0] API response status:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("[v0] API data:", data)
          const userNamecard = data[username.toLowerCase()]
          console.log("[v0] User namecard:", userNamecard)
          setHasExistingNamecard(!!userNamecard && userNamecard.trim() !== "")
        }
      } catch (err) {
        console.error("[v0] Error checking existing namecard:", err)
      } finally {
        setIsCheckingExisting(false)
      }
    }
    checkExistingNamecard()
  }, [username])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (GIF, PNG, JPG)")
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    setSelectedFile(file)
    setError("")

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl("")
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedFile) {
      setError("Please select a file")
      return
    }

    setIsLoading(true)

    try {
      // First, upload to Vercel Blob
      const formData = new FormData()
      formData.append("file", selectedFile)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file")
      }

      const { url: blobUrl } = await uploadResponse.json()

      // Then save the blob URL to the namecard
      const response = await fetch("/api/namecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, gifUrl: blobUrl }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess?.()
        onClose()
      } else {
        setError(data.error || "Failed to save namecard")
      }
    } catch (err) {
      console.error("[v0] Namecard upload error:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveNamecard = async () => {
    if (!confirm("Are you sure you want to remove your custom namecard?")) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/namecard", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess?.()
        onClose()
      } else {
        setError(data.error || "Failed to remove namecard")
      }
    } catch (err) {
      console.error("[v0] Namecard removal error:", err)
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
            600x100px) for best results.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gifFile">Upload GIF or Image</Label>
            {!selectedFile ? (
              <div className="flex items-center gap-2">
                <Input
                  id="gifFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2 border border-border rounded-lg bg-card">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
                <Button type="button" variant="ghost" size="sm" onClick={handleRemoveFile} className="h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Upload a GIF or image in 6:1 ratio (max 10MB). Animated GIFs work best!
            </p>
          </div>

          {previewUrl && (
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <div className="relative w-full h-20 rounded-lg overflow-hidden bg-black/20">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Namecard preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            {isCheckingExisting ? (
              <Button type="button" variant="outline" disabled className="mr-auto bg-transparent">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </Button>
            ) : hasExistingNamecard ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemoveNamecard}
                disabled={isLoading}
                className="mr-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Remove Namecard
                  </>
                )}
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground mr-auto">No existing namecard</span>
            )}

            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedFile}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
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
