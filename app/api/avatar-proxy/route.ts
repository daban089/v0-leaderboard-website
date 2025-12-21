import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get("username")

    if (!username) {
      return new NextResponse("Username is required", { status: 400 })
    }

    try {
      const pageResponse = await fetch(`https://mcskins.top/avatar-maker?username=${username}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      })

      if (pageResponse.ok) {
        const html = await pageResponse.text()

        // Look for links containing "avaBody3" or with id/anchor "#avaBody3"
        const avaBody3Match = html.match(
          /<a[^>]*(?:href="([^"]*avaBody3[^"]*)"[^>]*|[^>]*id="avaBody3"[^>]*href="([^"]+)")/i,
        )

        if (avaBody3Match) {
          const imageUrl = avaBody3Match[1] || avaBody3Match[2]
          console.log("[v0] Found avaBody3 avatar URL:", imageUrl)

          // Fetch the actual image
          const imageResponse = await fetch(imageUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0",
            },
          })

          if (imageResponse.ok) {
            const contentType = imageResponse.headers.get("content-type") || "image/png"
            const imageBuffer = await imageResponse.arrayBuffer()

            return new NextResponse(imageBuffer, {
              headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600",
                "Access-Control-Allow-Origin": "*",
              },
            })
          }
        }
      }
    } catch (error) {
      console.error("[v0] mcskins.top scraping failed:", error)
    }

    // Fallback to crafatar if mcskins.top scraping fails
    const fallbackUrl = `https://crafatar.com/renders/body/${username}?scale=4&overlay`

    try {
      const response = await fetch(fallbackUrl, {
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
      console.error("[v0] Fallback failed:", error)
    }

    // All sources failed, return 404
    return new NextResponse(null, { status: 404 })
  } catch (error) {
    console.error("[v0] Avatar proxy error:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
