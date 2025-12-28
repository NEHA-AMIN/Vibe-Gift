import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const runtime = "nodejs"

// Simple in-memory cache for resolved image URLs (per query)
const imageCache = new Map<string, string>()

async function isImageUrlAccessible(url: string): Promise<boolean> {
  if (!url) return false
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow'
    })
    
    clearTimeout(timeoutId)
    return response.ok && response.headers.get('content-type')?.startsWith('image/')
  } catch (error) {
    // Silently handle timeout and network errors - they're expected for invalid URLs
    if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
      return false
    }
    // Log other unexpected errors
    console.error(`Failed to check image URL: ${url.substring(0, 100)}...`, error instanceof Error ? error.message : String(error))
    return false
  }
}

function buildImageSearchQuery(productName: string, keywords?: string): string {
  const base = (keywords || productName || "").toLowerCase()

  const cleaned = base
    .replace(/\(.*?\)/g, "") // remove parenthetical noise
    .replace(/\+.*$/g, "") // drop trailing + metadata
    .replace(/[^a-z0-9\s-]/gi, " ") // strip special chars
    .replace(/\s+/g, " ")
    .trim()

  if (!cleaned) return ""

  // Nudge towards commercial pack-shot style images
  return `${cleaned} product photo`
}

type GoogleImageItem = {
  link?: string
  image?: {
    height?: number
    width?: number
    byteSize?: number
    thumbnailLink?: string
  }
}

function isAcceptableImageItem(item: GoogleImageItem): boolean {
  const h = item.image?.height
  const w = item.image?.width

  // If dimensions are known, filter out extreme aspect ratios and tiny images
  if (h && w) {
    const ratio = h / w
    if (ratio > 1.35 || ratio < 0.65) return false // avoid super-tall or super-wide banners
    if (h < 300 || w < 300) return false // avoid small/low-res
  }
  return true
}

async function fetchGoogleImage(productName: string, keywords?: string): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY
    const cx = process.env.GOOGLE_CUSTOM_SEARCH_CX

    if (!apiKey || !cx) {
      console.error("Missing GOOGLE_CUSTOM_SEARCH_API_KEY or GOOGLE_CUSTOM_SEARCH_CX")
      return ""
    }

    const query = buildImageSearchQuery(productName, keywords)
    if (!query) return ""

    const cacheKey = `${query}`
    const cached = imageCache.get(cacheKey)
    if (cached) return cached

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&searchType=image&num=5&imgType=photo`
    const response = await fetch(url)

    if (!response.ok) {
      console.error(`Google Custom Search error: ${response.status}`)
      return ""
    }

    const data = await response.json()
    const items: GoogleImageItem[] = Array.isArray(data.items) ? data.items : []

    // Prefer items with acceptable aspect ratio / size; fallback to any links if none match
    const primaryCandidates = items.filter(isAcceptableImageItem)
    const fallbackCandidates = primaryCandidates.length > 0 ? primaryCandidates : items

    const candidateLinks = fallbackCandidates
      .map((item) => item.link)
      .filter((link): link is string => typeof link === "string" && !!link)
      .slice(0, 5)

    for (const link of candidateLinks) {
      const ok = await isImageUrlAccessible(link)
      if (ok) {
        imageCache.set(cacheKey, link)
        return link
      }
    }

    return ""
  } catch (error) {
    console.error("Error fetching Google image:", error)
    return ""
  }
}

type GiftState = {
  ageGroup: string
  gender: string
  relationship: string
  occasion: string
  lifestyle: string
  budget: string
  aesthetic?: string
  risk?: string
}

const ageGroupLabels: Record<string, string> = {
  kids: "Kids (8–15 years)",
  teens: "Teens (15–22 years)",
  "young-adult": "Young Adult (23–29 years)",
  "genx-millennials": "Gen X / Millennials (30–45 years)",
  adults: "Adults (50–60 years)",
  "old-age": "Old Age (60+ years)",
}

const genderLabels: Record<string, string> = {
  female: "Female",
  male: "Male",
  "neutral": "Neutral / Prefer not to say",
}

const budgetLabels: Record<string, string> = {
  safe: "Safe & Thoughtful (₹800–₹1,500)",
  premium: "Premium (₹1,500–₹3,000)",
  "all-out": "Go all out (₹3,000+)",
}

type Recommendation = {
  id: string
  name: string
  image: string
  imageKeywords?: string
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
  const imageKeywords = typeof record.imageKeywords === "string" ? record.imageKeywords.trim() : undefined
  const idRaw = typeof record.id === "string" ? record.id.trim() : ""

  if (!name || !reasoning || !priceRange) return null

  return {
    id: idRaw || fallbackId,
    name,
    image,
    imageKeywords,
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

  const ageGroupLabel = ageGroupLabels[state.ageGroup] || state.ageGroup || "Not provided"
  const genderLabel = genderLabels[state.gender] || state.gender || "Not provided"
  const budgetLabel = budgetLabels[state.budget] || state.budget || "Not provided"

const prompt = `
You are an expert human-centric gifting intelligence system.

Your job is NOT to suggest random products.
Your job is to understand human context, age, culture, social risk, and life-stage — and translate that into thoughtful, appropriate gifts.

This system uses a Dynamic Branching + Life-Stage Protocol.
Different age groups operate on different emotional, cultural, and practical logics.
A 12-year-old, a 19-year-old sibling, a 28-year-old partner, and a 55-year-old parent must NEVER be evaluated using the same mental model.

--------------------------------------------------
RECIPIENT CONTEXT (FROM USER)
--------------------------------------------------

Relationship Category: ${state.relationship}
Occasion: ${state.occasion}
Age Group: ${ageGroupLabel}
Gender (only when relevant): ${genderLabel}
Lifestyle / Vibe (if applicable): ${state.lifestyle || "Not applicable"}
Aesthetic Preference (if applicable): ${state.aesthetic || "Neutral"}
Risk Tolerance: ${state.risk || "Safe"}
Budget Cap: ${budgetLabel}

--------------------------------------------------
STEP 0: AGE GROUP CLASSIFICATION (MANDATORY)
--------------------------------------------------

Classify the recipient into EXACTLY ONE age group:

- Kids → 8–15 years
- Teens → 15–22 years
- Young Adult → 23–29 years
- Gen X / Millennials → 30–45 years
- Adults → 50–60 years
- Old Age → 60+ years

You MUST adapt:
- Gift type
- Emotional tone
- Risk tolerance
- Utility vs novelty balance

based on this age group BEFORE applying relationship logic.

--------------------------------------------------
STEP 1: RELATIONSHIP-BASED TRACK SELECTION
--------------------------------------------------

Choose ONE track based on relationship:

A) Partner / Friend / Sibling  
→ DIGITAL NATIVE TRACK

B) Mom / Dad / Uncle / Aunt  
→ CLASSIC SOUL TRACK

C) Boss / Colleague  
→ CORPORATE TRACK

You MUST reason using ONLY the selected track.
Do NOT mix logics.
Age modifies the track — it does NOT override it.

--------------------------------------------------
TRACK A: DIGITAL NATIVE (PARTNERS / FRIENDS / SIBLINGS)
--------------------------------------------------
Core Focus: Identity, Expression, Lifestyle, Emotional Relevance.

Age Modulation:
- Kids (8–15): Safe fun, creativity, learning, pop culture
- Teens (15–22): Self-expression, campus life, trends, experimentation (within safety)
- Young Adult (23–29): Lifestyle upgrades, aesthetics, social signaling
- 30–45: Subtle premium, practicality with personality

Gift Traits:
- Visually appealing
- Emotion-forward
- Identity-expressive
- Age-appropriate risk

--------------------------------------------------
TRACK B: CLASSIC SOUL (PARENTS / OLDER FAMILY)
--------------------------------------------------
Core Focus: Comfort, Rituals, Familiarity, Quality of Life.

Age Modulation:
- 50–60: Health-aware, routine-enhancing, premium utility
- 60+: Comfort, nostalgia, simplicity, physical ease

Ignore modern aesthetics unless explicitly stated.

Use:
- Daily rituals (tea, music, devotion, walking)
- Comfort needs
- Emotional warmth

Gift Traits:
- Practical but thoughtful
- Comfort-enhancing
- Culturally appropriate
- Emotionally reassuring

--------------------------------------------------
TRACK C: CORPORATE (BOSS / COLLEAGUE)
--------------------------------------------------
Core Focus: Safety, Professionalism, Neutral Status.

Age Modulation:
- 30–45: Clean, functional, desk-friendly
- 50+: Premium-neutral, timeless utility

Avoid:
- Humor
- Personal intimacy
- Experimental gifts

Gift Traits:
- Professional
- Tasteful
- Low-risk
- Office-appropriate

--------------------------------------------------
RECOMMENDATION TASK
--------------------------------------------------

Based on AGE GROUP + TRACK + SIGNALS:

1. Infer the recipient’s lifestyle, constraints, and emotional expectations.
2. Recommend gifts that are:
   - Age-appropriate
   - Socially safe
   - Emotionally intelligent
   - Culturally relevant (Indian context)
3. Ensure all gifts are realistic and purchasable in India.

--------------------------------------------------
STRICT OUTPUT RULES
--------------------------------------------------

- Recommend EXACTLY 5 items:
  1–3 → Physical product gifts
  4 → One voucher-based gift card
  5 → One subscription-based gift

- Do NOT repeat categories.
- Each gift must reflect at least TWO contextual signals.
- Stay within the stated budget.
- Gift cards must be relevant in the Indian market.

--------------------------------------------------
OUTPUT FORMAT (NON-NEGOTIABLE)
--------------------------------------------------

Return ONLY a valid JSON array.
NO markdown.
NO explanations outside JSON.
NO extra text.

Each item MUST include:

- id: string
- name: string
- image: string (leave empty if unsure)
- imageKeywords: string (ONE simple visual keyword to search the product)
- reasoning: string (1–2 sentences explaining fit)
- priceRange: string (INR format)

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

    // Process images for each recommendation
    const recommendationsWithImages = await Promise.all(
      recommendations.slice(0, 5).map(async (rec) => {
        let finalImage = ""
        
        // Always fetch image via Google Custom Search using AI-provided keywords (or name fallback)
        finalImage = await fetchGoogleImage(rec.name, rec.imageKeywords)
        
        return {
          ...rec,
          image: finalImage,
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
