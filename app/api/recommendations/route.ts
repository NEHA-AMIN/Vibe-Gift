import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const runtime = "nodejs"

async function fetchUnsplashImage(productName: string): Promise<string> {
  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY
    if (!accessKey) {
      console.error("Missing UNSPLASH_ACCESS_KEY")
      return ""
    }

    const searchQuery = encodeURIComponent(productName)
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=1&orientation=portrait`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    )

    if (!response.ok) {
      console.error(`Unsplash API error: ${response.status}`)
      return ""
    }

    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular || ""
    }
    
    return ""
  } catch (error) {
    console.error("Error fetching Unsplash image:", error)
    return ""
  }
}

type GiftState = {
  relationship: string
  occasion: string
  generation: string
  lifestyle: string
  budget: string
}

type Recommendation = {
  id: string
  name: string
  image: string
  reasoning: string
  priceRange: string
}

function coerceRecommendation(item: unknown, fallbackId: string): Recommendation | null {
  if (!item || typeof item !== "object") return null
  const record = item as Record<string, unknown>

  const name = typeof record.name === "string" ? record.name.trim() : ""
  const reasoning = typeof record.reasoning === "string" ? record.reasoning.trim() : ""
  const priceRange = typeof record.priceRange === "string" ? record.priceRange.trim() : ""
  const image = typeof record.image === "string" ? record.image.trim() : ""
  const idRaw = typeof record.id === "string" ? record.id.trim() : ""

  if (!name || !reasoning || !priceRange) return null

  return {
    id: idRaw || fallbackId,
    name,
    image,
    reasoning,
    priceRange,
  }
}

function coerceRecommendations(value: unknown): Recommendation[] {
  if (!Array.isArray(value)) return []

  const recommendations: Recommendation[] = []
  for (let i = 0; i < value.length; i++) {
    const coerced = coerceRecommendation(value[i], String(i + 1))
    if (coerced) recommendations.push(coerced)
  }
  return recommendations
}

function extractJson(text: string): unknown {
  const trimmed = text.trim()

  // 1) Best case: pure JSON
  try {
    return JSON.parse(trimmed)
  } catch {
    // continue
  }

  // 2) Common pattern: ```json ...```
  const fenceRe = /```(?:json)?\s*([\s\S]*?)\s*```/i
  const fenced = fenceRe.exec(trimmed)
  if (fenced?.[1]) return JSON.parse(fenced[1].trim())

  // 3) Fallback: try to extract the first JSON array block
  const startArray = trimmed.indexOf("[")
  const endArray = trimmed.lastIndexOf("]")
  if (startArray !== -1 && endArray !== -1 && endArray > startArray) {
    return JSON.parse(trimmed.slice(startArray, endArray + 1))
  }

  // 4) Fallback: try to extract a JSON object block (then caller can coerce)
  const startObj = trimmed.indexOf("{")
  const endObj = trimmed.lastIndexOf("}")
  if (startObj !== -1 && endObj !== -1 && endObj > startObj) {
    return JSON.parse(trimmed.slice(startObj, endObj + 1))
  }

  throw new Error("Gemini response was not valid JSON")
}

function resolveModelName(configuredModel: string): string {
  const trimmed = configuredModel.trim()
  if (!trimmed) return "gemini-2.0-flash"
  return trimmed.startsWith("models/") ? trimmed.slice("models/".length) : trimmed
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 })
  }

  let state: GiftState
  try {
    state = (await req.json()) as GiftState
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const prompt = `You are a gifting assistant.

Given this user's gift preferences:
- Relationship: ${state.relationship}
- Occasion: ${state.occasion}
- Generation: ${state.generation}
- Lifestyle: ${state.lifestyle}
- Budget: ${state.budget}

Return EXACTLY a JSON array of 3 gift recommendations.
Each item MUST have these keys:
- id (string)
- name (string)
- image (string; can be empty)
- reasoning (string; 1-2 sentences)
- priceRange (string; in INR like "₹1,500 - ₹2,500")

Return ONLY JSON. No markdown, no commentary.`

  const configuredModel = process.env.GEMINI_MODEL || "gemini-2.0-flash"
  const modelName = resolveModelName(configuredModel)

  let geminiText = ""
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    })

    const result = await model.generateContent(prompt)
    geminiText = result.response.text() || ""
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: "Gemini request failed", details, model: modelName }, { status: 502 })
  }

  try {
    const parsed = extractJson(geminiText)
    const recommendations = coerceRecommendations(parsed)

    if (recommendations.length < 3) {
      return NextResponse.json(
        { error: "Gemini returned insufficient recommendations", raw: geminiText.slice(0, 800) },
        { status: 502 }
      )
    }

    // Fetch Unsplash images for each recommendation
    const recommendationsWithImages = await Promise.all(
      recommendations.slice(0, 3).map(async (rec) => {
        const image = await fetchUnsplashImage(rec.name)
        return {
          ...rec,
          image,
        }
      })
    )

    return NextResponse.json(recommendationsWithImages)
  } catch {
    return NextResponse.json({ error: "Failed to parse Gemini response", raw: geminiText.slice(0, 800) }, { status: 502 })
  }
}
