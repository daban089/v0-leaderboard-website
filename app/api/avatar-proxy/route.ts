import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get("username")

    if (!username) {
      return new NextResponse("Username is required", { status: 400 })
    }

    try {
      // Try to fetch player's UUID from Mojang API
      const mojangResponse = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)

      if (mojangResponse.ok) {
        const mojangData = await mojangResponse.json()
        const uuid = mojangData.id

        // Try crafty.gg render with the UUID
        const craftyUrl = `https://render.crafty.gg/3d/bust/${uuid}`
        const craftyResponse = await fetch(craftyUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
        })

        if (craftyResponse.ok) {
          const contentType = craftyResponse.headers.get("content-type") || "image/png"
          const imageBuffer = await craftyResponse.arrayBuffer()

          return new NextResponse(imageBuffer, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=3600",
              "Access-Control-Allow-Origin": "*",
            },
          })
        }
      }
    } catch (error) {
      console.error("[v0] crafty.gg fetch failed:", error)
    }

    const fallbackPath = join(process.cwd(), "public", "skin-404.avif")
    const fallbackImage = await readFile(fallbackPath)

    return new NextResponse(fallbackImage, {
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
