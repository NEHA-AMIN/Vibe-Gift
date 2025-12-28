"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchRecommendations } from "@/lib/mock-api"

const loadingMessages = [
  "Understanding their vibe…",
  "Matching personality to something meaningful…",
  "Curating the perfect gifts…",
]

export default function LoadingPage() {
  const router = useRouter()

  useEffect(() => {
    const loadAndNavigate = async () => {
      const giftStateJson = sessionStorage.getItem("giftState")
      if (!giftStateJson) {
        router.push("/flow")
        return
      }

      try {
        const giftState = JSON.parse(giftStateJson)
        const recs = await fetchRecommendations(giftState)
        sessionStorage.setItem("recommendationsCache", JSON.stringify(recs))
      } catch {
        // swallow errors; we'll let recommendations page refetch if needed
      } finally {
        router.push("/recommendations")
      }
    }

    loadAndNavigate()
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-3 animate-in fade-in duration-500">
        <div className="loader mx-auto" aria-label="Loading" />
        <h2 className="text-2xl md:text-3xl font-bold">Finding your perfect gifts</h2>
        <p className="text-muted-foreground">{loadingMessages[0]}</p>
      </div>
    </div>
  )
}
