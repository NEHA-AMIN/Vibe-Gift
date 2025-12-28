import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Gift, Sparkles, Clock } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">InstantGift</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              AI-Powered Gift Curation
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
              Forgot a moment? We'll fix it in 60 seconds.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Answer a few questions. We'll handle the thoughtfulness.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/flow">
              <Button size="lg" className="text-base px-8 py-6 h-auto">
                Find the perfect gift
              </Button>
            </Link>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Takes less than 60 seconds</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-16 border-t border-border">
            <div className="space-y-2">
              <div className="text-3xl font-bold">60s</div>
              <div className="text-sm text-muted-foreground">Average time to find perfect gift</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">AI-Curated</div>
              <div className="text-sm text-muted-foreground">Personalized recommendations</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">Same Day</div>
              <div className="text-sm text-muted-foreground">Delivery available</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
