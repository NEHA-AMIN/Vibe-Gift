"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, MapPin, Calendar, Clock, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function ConfirmationPage() {
  const router = useRouter()
  const [selectedGift, setSelectedGift] = useState<any>(null)
  const [deliveryData, setDeliveryData] = useState<any>(null)

  useEffect(() => {
    const giftJson = sessionStorage.getItem("selectedGift")
    const deliveryJson = sessionStorage.getItem("deliveryData")

    if (giftJson) setSelectedGift(JSON.parse(giftJson))
    if (deliveryJson) setDeliveryData(JSON.parse(deliveryJson))
  }, [])

  const handlePlaceOrder = () => {
    // Mock API call
    router.push("/success")
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  }

  const getTimeSlotLabel = (slot: string) => {
    const labels: Record<string, string> = {
      morning: "Morning (9 AM - 12 PM)",
      afternoon: "Afternoon (12 PM - 4 PM)",
      evening: "Evening (4 PM - 8 PM)",
    }
    return labels[slot] || slot
  }

  if (!selectedGift || !deliveryData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Missing order information</p>
          <Link href="/recommendations">
            <Button className="mt-4">Start over</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/delivery"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to delivery details
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Order Confirmation</h1>
            <p className="text-muted-foreground">Review your order before placing</p>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Selected Gift</h3>
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={selectedGift.image || "/placeholder.svg"}
                    alt={selectedGift.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{selectedGift.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{selectedGift.reasoning}</p>
                  <p className="text-sm font-medium text-primary mt-2">{selectedGift.priceRange}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-semibold">Delivery Details</h3>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium">Delivery Date</div>
                    <div className="text-sm text-muted-foreground">{formatDate(deliveryData.deliveryDate)}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium">Time Slot</div>
                    <div className="text-sm text-muted-foreground">{getTimeSlotLabel(deliveryData.deliveryTime)}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium">Delivery Address</div>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">{deliveryData.address}</div>
                  </div>
                </div>

                {deliveryData.personalNote && (
                  <div className="flex gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">Personal Note</div>
                      <div className="text-sm text-muted-foreground italic whitespace-pre-wrap">
                        "{deliveryData.personalNote}"
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <Button onClick={handlePlaceOrder} size="lg" className="w-full">
            Place Order
          </Button>
        </div>
      </div>
    </div>
  )
}
