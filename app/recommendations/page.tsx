"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, RefreshCw, Sparkles } from "lucide-react"
import Link from "next/link"
import { fetchRecommendations } from "@/lib/mock-api"

type Recommendation = {
  id: string
  name: string
  image: string
  reasoning: string
  priceRange: string
}

export default function RecommendationsPage() {
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const load = async () => {
      const giftStateJson = sessionStorage.getItem("giftState")
      if (!giftStateJson) return

      try {
        const giftState = JSON.parse(giftStateJson)
        const recs = await fetchRecommendations(giftState)
        setRecommendations(recs)
      } catch {
        setRecommendations([])
      }
    }

    load()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    const refresh = async () => {
      const giftStateJson = sessionStorage.getItem("giftState")
      if (!giftStateJson) {
        setIsRefreshing(false)
        return
      }

      try {
        const giftState = JSON.parse(giftStateJson)
        const recs = await fetchRecommendations(giftState)
        setRecommendations(recs)
      } catch {
        setRecommendations([])
      } finally {
        setIsRefreshing(false)
      }
    }

    refresh()
  }

  const handleSelectGift = (gift: Recommendation) => {
    sessionStorage.setItem("selectedGift", JSON.stringify(gift))
    router.push("/delivery")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/flow"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to questions
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Curated for you
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Your perfect gift matches</h1>
            <p className="text-muted-foreground">We've selected these gifts based on your answers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map((gift) => (
              <Card key={gift.id} className="overflow-hidden flex flex-col">
                <div className="aspect-square bg-muted relative">
                  <img src={gift.image || "/placeholder.svg"} alt={gift.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg mb-2">{gift.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 flex-1">{gift.reasoning}</p>
                  <div className="text-sm font-medium text-primary mb-4">{gift.priceRange}</div>
                  <Button onClick={() => handleSelectGift(gift)} className="w-full">
                    Select this gift
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {recommendations.length > 3 && (
            <div className="space-y-4 mt-12">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Gift Cards & Subscriptions</h2>
                <p className="text-muted-foreground text-sm">Give the gift of choice and flexibility</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {recommendations.slice(3, 5).map((gift) => (
                  <Card key={gift.id} className="overflow-hidden flex flex-col">
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 relative flex items-center justify-center">
                      <img src={gift.image || "/placeholder.svg"} alt={gift.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-semibold text-lg mb-2">{gift.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 flex-1">{gift.reasoning}</p>
                      <div className="text-sm font-medium text-primary mb-4">{gift.priceRange}</div>
                      <Button onClick={() => handleSelectGift(gift)} className="w-full">
                        Select this gift
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="gap-2 bg-transparent">
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh recommendations"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
