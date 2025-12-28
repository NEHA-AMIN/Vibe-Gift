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

    // Enhanced search term extraction
    let searchQuery = productName.toLowerCase()
    
    // Remove common prefixes/modifiers that make searches too specific
    searchQuery = searchQuery
      .replace(/^(personalized|customized|custom|premium|luxury|exclusive|handcrafted|artisan|designer)\s+/gi, "")
      .replace(/\s+(set|kit|pack|box|bundle|collection)\s*(\(.*?\))?$/gi, "")
      .replace(/\(.*?\)/g, "") // Remove content in parentheses like (12pc)
      .replace(/\+.*$/g, "") // Remove everything after + sign
      .trim()

    // Special handling for gift cards and subscriptions
    if (searchQuery.includes("gift card") || searchQuery.includes("voucher")) {
      // Extract the brand/category before "gift card"
      const match = searchQuery.match(/^(.+?)\s+(gift card|voucher)/i)
      if (match) {
        const category = match[1]
        // For specific brands, search for the category instead
        if (category.includes("salon") || category.includes("spa")) {
          searchQuery = "luxury spa salon interior"
        } else if (category.includes("restaurant") || category.includes("dining")) {
          searchQuery = "fine dining restaurant"
        } else {
          searchQuery = `${category} gift`
        }
      }
    } else if (searchQuery.includes("subscription")) {
      // For subscriptions, search for the service/category
      const match = searchQuery.match(/^(.+?)\s+subscription/i)
      if (match) {
        const service = match[1]
        if (service.includes("food") || service.includes("swiggy") || service.includes("zomato")) {
          searchQuery = "food delivery service"
        } else if (service.includes("fitness") || service.includes("cult") || service.includes("gym")) {
          searchQuery = "fitness workout gym"
        } else if (service.includes("music") || service.includes("spotify")) {
          searchQuery = "music streaming headphones"
        } else {
          searchQuery = service
        }
      }
    }

    // Try primary search
    let response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=portrait`,
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

    let data = await response.json()
    
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular || ""
    }

    // Fallback: Try with just the first significant word
    const firstWord = searchQuery.split(" ")[0]
    if (firstWord && firstWord.length > 3) {
      response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(firstWord)}&per_page=1&orientation=portrait`,
        {
          headers: {
            Authorization: `Client-ID ${accessKey}`,
          },
        }
      )

      if (response.ok) {
        data = await response.json()
        if (data.results && data.results.length > 0) {
          return data.results[0].urls.regular || ""
        }
      }
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
  aesthetic?: string
  risk?: string
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
    const parsed = JSON.parse(trimmed)
    // If it's an object with an array property, return the array
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      // Check for common wrapper keys
      const arrayKeys = ["gifts", "recommendations", "items", "data", "results"]
      for (const key of arrayKeys) {
        if (Array.isArray(parsed[key])) {
          return parsed[key]
        }
      }
      // If no wrapper found, look for the first array property
      const firstArrayValue = Object.values(parsed).find((v) => Array.isArray(v))
      if (firstArrayValue) return firstArrayValue
    }
    return parsed
  } catch {
    // continue
  }

  // 2) Common pattern: ```json ...```
  const fenceRe = /```(?:json)?\s*([\s\S]*?)\s*```/i
  const fenced = fenceRe.exec(trimmed)
  if (fenced?.[1]) {
    try {
      const parsed = JSON.parse(fenced[1].trim())
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const firstArrayValue = Object.values(parsed).find((v) => Array.isArray(v))
        if (firstArrayValue) return firstArrayValue
      }
      return parsed
    } catch {
      // continue
    }
  }

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
    const parsed = JSON.parse(trimmed.slice(startObj, endObj + 1))
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const firstArrayValue = Object.values(parsed).find((v) => Array.isArray(v))
      if (firstArrayValue) return firstArrayValue
    }
    return parsed
  }

  throw new Error("Gemini response was not valid JSON")
}

function resolveModelName(configuredModel: string): string {
  const trimmed = configuredModel.trim()
  if (!trimmed) return "gemini-2.0-flash"
  return trimmed.startsWith("models/") ? trimmed.slice("models/".length) : trimmed
}

async function callGrokAPI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-3",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that returns only valid JSON. When asked for an array, return ONLY the array without wrapping it in an object.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Grok API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ""
}

export async function POST(req: Request) {
  const aiProvider = process.env.AI_PROVIDER || "grok" // Default to Grok
  const geminiApiKey = process.env.GEMINI_API_KEY
  const grokApiKey = process.env.GROK_API_KEY

  if (aiProvider === "gemini" && !geminiApiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 })
  }

  if (aiProvider === "grok" && !grokApiKey) {
    return NextResponse.json({ error: "Missing GROK_API_KEY" }, { status: 500 })
  }

  let state: GiftState
  try {
    state = (await req.json()) as GiftState
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

const prompt = `
You are an expert human-centric gifting intelligence system.

Your job is NOT to suggest random products.
Your job is to understand human context, age, culture, and social risk, and then translate that into thoughtful, appropriate gifts.

This system uses a Dynamic Branching Protocol.
Different people are profiled using different mental models.
A 20-year-old partner and a 50-year-old mother must NEVER be evaluated using the same logic.

--------------------------------------------------
RECIPIENT CONTEXT (FROM USER)
--------------------------------------------------

Relationship Category: ${state.relationship}
Occasion: ${state.occasion}
Generation: ${state.generation}

Primary Vibe Signal (if applicable):
- Saturday Night / Lifestyle Vibe: ${state.lifestyle || "Not applicable"}

Secondary Vibe Signal (if applicable):
- Aesthetic / Visual Identity: ${state.aesthetic || "Neutral"}

Risk Tolerance:
- Risk Level: ${state.risk || "Safe"}

Budget Constraint:
- Budget Cap: ₹${state.budget}

--------------------------------------------------
DYNAMIC BRANCHING RULES (VERY IMPORTANT)
--------------------------------------------------

Step 1: Identify the correct profiling track based on Relationship Category.

A) If relationship is Partner / Friend / Sibling  
→ Use the "Digital Native" Track (Gen Z / Young Millennial)

B) If relationship is Mom / Dad / Uncle / Aunt  
→ Use the "Classic Soul" Track (Parents / Older Generation)

C) If relationship is Boss / Colleague  
→ Use the "Corporate" Track (Professional, Low-Risk)

You MUST reason using ONLY the logic of the selected track.
Do NOT mix tracks.
Do NOT apply Gen Z aesthetics to parents.
Do NOT apply nostalgia logic to young partners.
Cultural mismatch is a failure.

--------------------------------------------------
TRACK A: DIGITAL NATIVE (GEN Z / YOUNG MILLENNIAL)
--------------------------------------------------
Focus: Identity, Aesthetics, Lifestyle Signaling.

Use these signals:
- Saturday Night behavior (club / comfort / dinner party)
- Visual identity (minimalist / neon / earthy)
- Occasion context
- Budget and risk tolerance

Gift characteristics:
- Visually appealing
- Instagrammable
- Emotion-forward
- Identity-expressive

--------------------------------------------------
TRACK B: CLASSIC SOUL (PARENTS / OLDER GENERATION)
--------------------------------------------------
Focus: Rituals, Comfort, Nostalgia, Quality of Life.

Ignore modern “aesthetic” trends unless explicitly stated.
Parents value usefulness, familiarity, and emotional warmth.

Use these signals:
- 5 PM ritual proxy (tea, activity, devotion)
- Common complaints (boredom, body pain, organization)
- Occasion
- Budget

Gift characteristics:
- Improves daily life
- Evokes nostalgia or comfort
- Practical but thoughtful
- Culturally appropriate

Examples of acceptable thinking:
- Old music → nostalgia audio devices
- Physical discomfort → comfort products
- Ritual habits → premium ritual accessories

--------------------------------------------------
TRACK C: CORPORATE (BOSS / COLLEAGUE)
--------------------------------------------------
Focus: Safety, Status, Utility, Neutrality.

Avoid:
- Overly personal gifts
- Humor
- Emotional intimacy

Use these signals:
- Desk persona (chaos / zen / status)
- Occasion (welcome, promotion, farewell)
- Budget

Gift characteristics:
- Professional
- Tasteful
- Status-neutral or mildly premium
- Office-appropriate

--------------------------------------------------
RECOMMENDATION TASK
--------------------------------------------------

Based on the correct track and signals:

1. Deeply infer the recipient’s preferences and constraints.
2. Recommend gifts that feel:
   - Socially safe
   - Emotionally intelligent
   - Age-appropriate
   - Culturally relevant (Indian context)
3. Ensure gifts are realistic and purchasable in India.

--------------------------------------------------
STRICT OUTPUT RULES
--------------------------------------------------

- Recommend EXACTLY 5 items total:
  * First 3 items: Physical product gifts (as per track logic)
  * Item 4: One voucher-based gift card (Salon, Spa, Restaurant, etc.)
  * Item 5: One subscription-based gift card (Cult Fit, Swiggy One, Zomato Pro, etc.)
- Each gift must be meaningfully different.
- Do NOT repeat categories within the same section.
- Each gift must clearly reflect at least TWO signals from the profile.
- Stay within the stated budget cap.
- Gift cards should be practical and relevant to Indian market.

--------------------------------------------------
OUTPUT FORMAT (NON-NEGOTIABLE)
--------------------------------------------------

Return ONLY a valid JSON array.
NO markdown.
NO explanations outside JSON.
NO extra text.

Each item in the array MUST have:

- id: string
- name: string
- image: string (can be empty)
- reasoning: string (1–2 sentences explaining why this gift fits THIS person)
- priceRange: string (INR format, e.g. "₹1,500 - ₹2,500")

Return ONLY the JSON array.
`;

  let responseText = ""
  let modelName = ""

  try {
    if (aiProvider === "grok") {
      modelName = "grok-3"
      responseText = await callGrokAPI(prompt, grokApiKey!)
    } else {
      // Use Gemini
      const configuredModel = process.env.GEMINI_MODEL || "gemini-2.0-flash"
      modelName = resolveModelName(configuredModel)
      const genAI = new GoogleGenerativeAI(geminiApiKey!)
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      })
      const result = await model.generateContent(prompt)
      responseText = result.response.text() || ""
    }
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `${aiProvider.toUpperCase()} request failed`, details, model: modelName, provider: aiProvider },
      { status: 502 }
    )
  }

  try {
    const parsed = extractJson(responseText)
    const recommendations = coerceRecommendations(parsed)

    if (recommendations.length < 5) {
      return NextResponse.json(
        { error: `${aiProvider.toUpperCase()} returned insufficient recommendations`, raw: responseText.slice(0, 800) },
        { status: 502 }
      )
    }

    // Fetch Unsplash images for each recommendation
    const recommendationsWithImages = await Promise.all(
      recommendations.slice(0, 5).map(async (rec) => {
        const image = await fetchUnsplashImage(rec.name)
        return {
          ...rec,
          image,
        }
      })
    )

    return NextResponse.json(recommendationsWithImages)
  } catch {
    return NextResponse.json(
      { error: `Failed to parse ${aiProvider.toUpperCase()} response`, raw: responseText.slice(0, 800) },
      { status: 502 }
    )
  }
}
