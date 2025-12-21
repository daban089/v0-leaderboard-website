import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 })
  }

  try {
    // First, get the UUID from Mojang API
    const mojangResponse = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)

    if (!mojangResponse.ok) {
      return NextResponse.json({
        fallback: `https://crafatar.com/renders/bust/${username}?scale=4&overlay=true`,
      })
    }

    const mojangData = await mojangResponse.json()
    const uuid = mojangData.id

    // Format UUID with dashes
    const formattedUuid = uuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5")

    // Try to fetch from crafty.gg using the UUID
    const craftyUrl = `https://render.crafty.gg/3d/bust/${uuid}`

    return NextResponse.json({
      avatarUrl: craftyUrl,
      uuid: formattedUuid,
    })
  } catch (error) {
    console.error("[v0] Error fetching crafty avatar:", error)
    return NextResponse.json({
      fallback: `https://crafatar.com/renders/bust/${username}?scale=4&overlay=true`,
    })
  }
}
