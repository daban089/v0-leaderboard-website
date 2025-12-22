import { HighTiersAdmin } from "@/components/high-tiers-admin"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>
        <HighTiersAdmin />
      </div>
    </div>
  )
}
