import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get("username")

    if (!username) {
      return new NextResponse("Username is required", { status: 400 })
    }

    console.log("[v0] Fetching avatar for:", username)

    try {
      // Try to fetch player's UUID from Mojang API
      const mojangResponse = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)

      if (mojangResponse.ok) {
        const mojangData = await mojangResponse.json()
        const uuid = mojangData.id

        console.log("[v0] Found UUID:", uuid)

        // Try crafty.gg render with the UUID
        const craftyUrl = `https://render.crafty.gg/3d/bust/${uuid}`
        const craftyResponse = await fetch(craftyUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
        })

        if (craftyResponse.ok) {
          console.log("[v0] crafty.gg success for:", username)
          const contentType = craftyResponse.headers.get("content-type") || "image/png"
          const imageBuffer = await craftyResponse.arrayBuffer()

          return new NextResponse(imageBuffer, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=3600",
              "Access-Control-Allow-Origin": "*",
            },
          })
        } else {
          console.log("[v0] crafty.gg failed with status:", craftyResponse.status)
        }
      }
    } catch (error) {
      console.error("[v0] crafty.gg fetch failed:", error)
    }

    console.log("[v0] Using fallback avatar for:", username)
    const fallbackUrl = "/images/skin-404.avif"

    const fallbackResponse = await fetch(fallbackUrl)
    const fallbackBuffer = await fallbackResponse.arrayBuffer()

    return new NextResponse(fallbackBuffer, {
      headers: {
        "Content-Type": "image/avif",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("[v0] Avatar proxy error:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
