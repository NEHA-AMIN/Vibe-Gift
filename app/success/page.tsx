import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Clock } from "lucide-react"

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">You just made someone's day 💛</h1>
          <p className="text-muted-foreground">Your thoughtful gift is on its way</p>
        </div>

        <Card className="p-4 bg-accent">
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="text-left">
              <div className="font-medium">Estimated Delivery</div>
              <div className="text-muted-foreground">Within your selected time slot</div>
            </div>
          </div>
        </Card>

        <div className="pt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            You'll receive an email confirmation with tracking details shortly.
          </p>

          <Link href="/">
            <Button variant="outline" className="w-full bg-transparent">
              Send another gift
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
