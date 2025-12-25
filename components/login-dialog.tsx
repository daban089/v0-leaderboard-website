"use client"
import { DiscordPinDialog } from "./discord-pin-dialog"

interface LoginDialogProps {
  onLogin: (username: string) => void
  onClose: () => void
}

export function LoginDialog({ onLogin, onClose }: LoginDialogProps) {
  return <DiscordPinDialog onLogin={onLogin} onClose={onClose} />
}
