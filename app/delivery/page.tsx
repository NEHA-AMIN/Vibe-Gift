"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function DeliveryPage() {
  const router = useRouter()
  const [selectedGift, setSelectedGift] = useState<any>(null)
  const [deliveryDate, setDeliveryDate] = useState("")
  const [deliveryTime, setDeliveryTime] = useState("")
  const [address, setAddress] = useState("")
  const [personalNote, setPersonalNote] = useState("")

  useEffect(() => {
    const giftJson = sessionStorage.getItem("selectedGift")
    if (giftJson) {
      setSelectedGift(JSON.parse(giftJson))
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const deliveryData = {
      deliveryDate,
      deliveryTime,
      address,
      personalNote,
    }

    sessionStorage.setItem("deliveryData", JSON.stringify(deliveryData))
    router.push("/confirmation")
  }

  if (!selectedGift) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No gift selected</p>
          <Link href="/recommendations">
            <Button className="mt-4">Back to recommendations</Button>
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
            href="/recommendations"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to recommendations
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Delivery & Personalisation</h1>
            <p className="text-muted-foreground">Add the final touches to your gift</p>
          </div>

          <Card className="p-6">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={selectedGift.image || "/placeholder.svg"}
                  alt={selectedGift.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold">{selectedGift.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{selectedGift.priceRange}</p>
              </div>
            </div>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Delivery Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Delivery Time Slot</Label>
                  <select
                    id="time"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select a time slot</option>
                    <option value="morning">Morning (9 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                    <option value="evening">Evening (4 PM - 8 PM)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter complete delivery address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Personal Note (Optional)</Label>
                  <Textarea
                    id="note"
                    placeholder="Add a personal message to make it extra special..."
                    value={personalNote}
                    onChange={(e) => setPersonalNote(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">This will be included as a card with your gift</p>
                </div>
              </div>
            </Card>

            <Button type="submit" size="lg" className="w-full">
              Confirm gift
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
