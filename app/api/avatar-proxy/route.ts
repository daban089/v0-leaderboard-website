import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get("username")

    if (!username) {
      return new NextResponse("Username is required", { status: 400 })
    }

    try {
      // Fetch the mcskins.top page for this username
      const pageResponse = await fetch(`https://mcskins.top/avatar-maker?username=${username}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      })

      if (pageResponse.ok) {
        const html = await pageResponse.text()

        // Parse HTML to find the 7th child link in #output
        // The pattern looks like: <a href="URL">...</a>
        const outputMatch = html.match(/<div[^>]*id="output"[^>]*>([\s\S]*?)<\/div>/i)

        if (outputMatch) {
          const outputContent = outputMatch[1]
          // Get all <a> tags
          const linkMatches = outputContent.match(/<a[^>]*href="([^"]+)"[^>]*>/g)

          if (linkMatches && linkMatches.length >= 7) {
            // Get the 7th link (index 6)
            const seventhLink = linkMatches[6]
            const urlMatch = seventhLink.match(/href="([^"]+)"/)

            if (urlMatch) {
              const imageUrl = urlMatch[1]
              console.log("[v0] Found avatar URL from mcskins.top:", imageUrl)

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
