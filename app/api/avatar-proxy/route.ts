import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get("username")

    if (!username) {
      return new NextResponse("Username is required", { status: 400 })
    }

    // Try multiple avatar sources
    const sources = [
      `https://mcskins.top/avatar/${username}/avatarBody3`,
      `https://crafatar.com/renders/body/${username}?scale=4&overlay`,
      `https://mc-heads.net/body/${username}/88`,
    ]

    let lastError: Error | null = null

    for (const url of sources) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
        })

        if (response.ok) {
          const contentType = response.headers.get("content-type") || "image/png"
          const imageBuffer = await response.arrayBuffer()

          return new NextResponse(imageBuffer, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=3600",
              "Access-Control-Allow-Origin": "*",
            },
          })
        }
      } catch (error) {
        lastError = error as Error
        continue
      }
    }

    // All sources failed, return placeholder
    return new NextResponse(null, { status: 404 })
  } catch (error) {
    console.error("[v0] Avatar proxy error:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
