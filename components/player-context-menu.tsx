"use client"

import { useState, useEffect } from "react"
import { Copy, Check } from "lucide-react"

interface PlayerContextMenuProps {
  username: string
  uuid?: string
  discord?: string
  x: number
  y: number
  onClose: () => void
}

export function PlayerContextMenu({ username, uuid, discord, x, y, onClose }: PlayerContextMenuProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    const handleClickOutside = () => onClose()
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [onClose])

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error("[v0] Failed to copy:", err)
    }
  }

  return (
    <div
      className="fixed bg-background border border-border rounded-lg shadow-lg z-50 py-2 min-w-max"
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Copy Username */}
      <button
        onClick={() => copyToClipboard(username, "username")}
        className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 transition-colors"
      >
        {copiedField === "username" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        <span>{copiedField === "username" ? "Copied!" : "Copy Username"}</span>
      </button>

      {/* Copy UUID */}
      <button
        onClick={() => copyToClipboard(uuid || username, "uuid")}
        className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 transition-colors"
      >
        {copiedField === "uuid" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        <span>{copiedField === "uuid" ? "Copied!" : "Copy UUID"}</span>
      </button>

      {/* Copy Discord */}
      {discord && (
        <button
          onClick={() => copyToClipboard(discord, "discord")}
          className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 transition-colors"
        >
          {copiedField === "discord" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          <span>{copiedField === "discord" ? "Copied!" : "Copy Discord"}</span>
        </button>
      )}
    </div>
  )
}
