import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get("username")

    if (!username) {
      return new NextResponse("Username is required", { status: 400 })
    }

    const isBedrockPlayer = username.startsWith(".")
    const lookupUsername = isBedrockPlayer ? "Vernito" : username

    if (isBedrockPlayer) {
      console.log("[v0] Bedrock player detected, using Vernito skin for:", username)
    } else {
      console.log("[v0] Fetching avatar for Java player:", username)
    }

    try {
      const mojangResponse = await fetch(`https://api.mojang.com/users/profiles/minecraft/${lookupUsername}`)

      if (mojangResponse.ok) {
        const mojangData = await mojangResponse.json()
        const uuid = mojangData.id

        console.log("[v0] Found UUID:", uuid, "for lookup username:", lookupUsername)

        const craftyUrl = `https://render.crafty.gg/3d/bust/${uuid}`
        const craftyResponse = await fetch(craftyUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
        })

        if (craftyResponse.ok) {
          console.log("[v0] crafty.gg success for:", lookupUsername)
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

    console.log("[v0] Using fallback avatar for:", lookupUsername)
    const fallbackAvatarUrl = "/images/skin-404.avif"
    const fallbackResponse = await fetch(fallbackAvatarUrl)
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
