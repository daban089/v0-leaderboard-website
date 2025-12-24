import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { Buffer } from "buffer"

const extractColorsFromImage = async (fileBuffer: Buffer, mimeType: string): Promise<string[]> => {
  try {
    // Create a temporary data URL for color extraction
    const base64 = fileBuffer.toString("base64")
    const dataUrl = `data:${mimeType};base64,${base64}`

    // For server-side extraction, we'll use a simple color sampling approach
    // by analyzing the buffer directly
    const colorCounts: Record<string, number> = {}

    // Sample every 100th byte to get color distribution (efficient sampling)
    for (let i = 0; i < fileBuffer.length; i += 300) {
      if (i + 2 < fileBuffer.length) {
        const r = fileBuffer[i]
        const g = fileBuffer[i + 1]
        const b = fileBuffer[i + 2]

        // Skip very dark or very light pixels
        if ((r < 30 && g < 30 && b < 30) || (r > 250 && g > 250 && b > 250)) continue

        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
        colorCounts[hex] = (colorCounts[hex] || 0) + 1
      }
    }

    // Get top 3 most frequent colors
    const topColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0])

    // Fallback to default if not enough colors found
    return topColors.length >= 3 ? topColors : [...topColors, "#ff6b35", "#f7931e", "#c1121f"].slice(0, 3)
  } catch (error) {
    console.error("[v0] Color extraction error:", error)
    return ["#ff6b35", "#f7931e", "#c1121f"]
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const username = formData.get("username") as string

    if (!file || !username) {
      return NextResponse.json({ error: "No file or username provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    // Convert file to buffer for color extraction
    const buffer = Buffer.from(await file.arrayBuffer())
    const colors = await extractColorsFromImage(buffer, file.type)

    // Upload to Vercel Blob with unique filename
    const filename = `namecard-${Date.now()}-${file.name}`
    const blob = await put(filename, file, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      colors,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
