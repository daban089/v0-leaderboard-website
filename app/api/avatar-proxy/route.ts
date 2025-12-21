import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get("username")

    if (!username) {
      return new NextResponse("Username is required", { status: 400 })
    }

    const isBedrockPlayer = username.startsWith(".")

    if (isBedrockPlayer) {
      console.log("[v0] Bedrock player detected, using question mark avatar:", username)

      const bedrockAvatarUrl = "/images/skin-404.avif"
      const response = await fetch(bedrockAvatarUrl)
      const imageBuffer = await response.arrayBuffer()

      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": "image/avif",
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": "*",
        },
      })
    }

    console.log("[v0] Fetching avatar for Java player:", username)

    try {
      const mojangResponse = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)

      if (mojangResponse.ok) {
        const mojangData = await mojangResponse.json()
        const uuid = mojangData.id

        console.log("[v0] Found UUID:", uuid)

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
