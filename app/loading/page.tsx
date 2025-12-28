"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Sparkles } from "lucide-react"

const loadingMessages = [
  "Understanding their vibe…",
  "Matching personality to something meaningful…",
  "Curating the perfect gifts…",
]

export default function LoadingPage() {
  const router = useRouter()

  useEffect(() => {
    const messageInterval = setInterval(() => {
      // Cycle through messages
    }, 1000)

    const timeout = setTimeout(() => {
      router.push("/recommendations")
    }, 3000)

    return () => {
      clearInterval(messageInterval)
      clearTimeout(timeout)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-center">
          <div className="relative">
            <Sparkles className="h-16 w-16 text-primary animate-pulse" />
            <Loader2 className="h-16 w-16 text-primary/30 animate-spin absolute inset-0" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">Finding your perfect gifts</h2>
          <p className="text-muted-foreground animate-pulse">{loadingMessages[0]}</p>
        </div>
      </div>
    </div>
  )
}
