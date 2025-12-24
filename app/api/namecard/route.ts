import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { username, gifUrl } = await request.json()

    if (!username || !gifUrl) {
      return NextResponse.json({ error: "Username and GIF URL are required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(gifUrl)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Insert or update the custom namecard in Neon
    await sql`
      INSERT INTO custom_namecards (username, namecard_url, updated_at)
      VALUES (${username.toLowerCase()}, ${gifUrl}, NOW())
      ON CONFLICT (username) 
      DO UPDATE SET namecard_url = ${gifUrl}, updated_at = NOW()
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving namecard:", error)
    return NextResponse.json({ error: "Failed to save custom namecard" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const result = await sql`
      SELECT username, namecard_url 
      FROM custom_namecards
    `

    // Convert to object map for easy lookup
    const namecards: Record<string, string> = {}
    result.forEach((row: any) => {
      namecards[row.username.toLowerCase()] = row.namecard_url
    })

    return NextResponse.json(namecards)
  } catch (error) {
    console.error("[v0] Error fetching namecards:", error)
    return NextResponse.json({ error: "Failed to fetch namecards" }, { status: 500 })
  }
}
