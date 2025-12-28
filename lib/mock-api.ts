// API functions for recommendations (Gemini-backed)

export type GiftState = {
  ageGroup: string
  gender: string
  relationship: string
  occasion: string
  lifestyle: string
  budget: string
}

export type Recommendation = {
  id: string
  name: string
  image: string
  reasoning: string
  priceRange: string
}

export async function fetchRecommendations(state: GiftState): Promise<Recommendation[]> {
  const response = await fetch("/api/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch recommendations")
  }

  return (await response.json()) as Recommendation[]
}
