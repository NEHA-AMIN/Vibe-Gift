"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

type GiftState = {
  relationship: string
  occasion: string
  generation: string
  lifestyle: string
  budget: string
}

export default function FlowPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [state, setState] = useState<GiftState>({
    relationship: "",
    occasion: "",
    generation: "",
    lifestyle: "",
    budget: "",
  })

  const totalSteps = 5
  const progress = (step / totalSteps) * 100

  const handleSelection = (key: keyof GiftState, value: string) => {
    setState((prev) => ({ ...prev, [key]: value }))

    if (step < totalSteps) {
      setTimeout(() => setStep(step + 1), 300)
    } else {
      // Final step - save state and navigate
      setTimeout(() => {
        sessionStorage.setItem("giftState", JSON.stringify({ ...state, [key]: value }))
        router.push("/recommendations")
      }, 300)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const getOccasionOptions = () => {
    const baseOptions = [
      { label: "Birthday", value: "birthday" },
      { label: "Just to make them feel special", value: "special" },
      { label: "Congratulations (promotion / achievement)", value: "congratulations" },
      { label: "Wedding", value: "wedding" },
    ]

    if (state.relationship === "partner" || state.relationship === "parent") {
      baseOptions.push({ label: "Anniversary", value: "anniversary" })
    }

    if (state.relationship === "colleague") {
      baseOptions.push({ label: "Welcome to the team", value: "welcome" })
    }

    if (state.relationship === "partner") {
      baseOptions.push({ label: "Period care", value: "period-care" })
    }

    return baseOptions
  }

  const getLifestyleOptions = () => {
    if (state.generation === "gen-z" || state.generation === "millennial") {
      return {
        prompt: "It's Saturday night, 9 PM. What are they most likely doing?",
        options: [
          { label: "At a café / aesthetic place", value: "cafe" },
          { label: "Working or hustling", value: "working" },
          { label: "In pyjamas watching Netflix", value: "netflix" },
          { label: "Out socialising", value: "socialising" },
        ],
      }
    } else {
      return {
        prompt: "What do they genuinely enjoy?",
        options: [
          { label: "Cooking or hosting at home", value: "cooking" },
          { label: "Morning rituals (tea / coffee / calm routines)", value: "morning" },
          { label: "Home decor or keeping things nice", value: "decor" },
          { label: "Quiet hobbies (reading, journaling)", value: "hobbies" },
        ],
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8 space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Question {step} of {totalSteps}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {step === 1 && (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-balance">Who do you want to gift?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <OptionCard
                  label="Friend"
                  onClick={() => handleSelection("relationship", "friend")}
                  selected={state.relationship === "friend"}
                />
                <OptionCard
                  label="Colleague"
                  onClick={() => handleSelection("relationship", "colleague")}
                  selected={state.relationship === "colleague"}
                />
                <OptionCard
                  label="Parent / Sibling"
                  onClick={() => handleSelection("relationship", "parent")}
                  selected={state.relationship === "parent"}
                />
                <OptionCard
                  label="Partner / Lover"
                  onClick={() => handleSelection("relationship", "partner")}
                  selected={state.relationship === "partner"}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-balance">What's the occasion?</h2>
              <div className="grid grid-cols-1 gap-3">
                {getOccasionOptions().map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    onClick={() => handleSelection("occasion", option.value)}
                    selected={state.occasion === option.value}
                  />
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-balance">Which generation do they belong to?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <OptionCard
                  label="Gen Z (18–26)"
                  onClick={() => handleSelection("generation", "gen-z")}
                  selected={state.generation === "gen-z"}
                />
                <OptionCard
                  label="Millennial (27–45)"
                  onClick={() => handleSelection("generation", "millennial")}
                  selected={state.generation === "millennial"}
                />
                <OptionCard
                  label="Gen X / Parent (46–65)"
                  onClick={() => handleSelection("generation", "gen-x")}
                  selected={state.generation === "gen-x"}
                />
                <OptionCard
                  label="Elder (65+)"
                  onClick={() => handleSelection("generation", "elder")}
                  selected={state.generation === "elder"}
                />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-balance">{getLifestyleOptions().prompt}</h2>
              <div className="grid grid-cols-1 gap-3">
                {getLifestyleOptions().options.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    onClick={() => handleSelection("lifestyle", option.value)}
                    selected={state.lifestyle === option.value}
                  />
                ))}
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-balance">What feels right for this gift?</h2>
              <div className="grid grid-cols-1 gap-4">
                <OptionCard
                  label="Safe & Thoughtful"
                  subtitle="₹800–₹1,500"
                  onClick={() => handleSelection("budget", "safe")}
                  selected={state.budget === "safe"}
                />
                <OptionCard
                  label="Premium"
                  subtitle="₹1,500–₹3,000"
                  onClick={() => handleSelection("budget", "premium")}
                  selected={state.budget === "premium"}
                />
                <OptionCard
                  label="Go all out"
                  subtitle="₹3,000+"
                  onClick={() => handleSelection("budget", "all-out")}
                  selected={state.budget === "all-out"}
                />
              </div>
            </>
          )}

          {step > 1 && (
            <Button variant="ghost" onClick={handleBack} className="mt-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous question
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function OptionCard({
  label,
  subtitle,
  onClick,
  selected,
}: {
  label: string
  subtitle?: string
  onClick: () => void
  selected?: boolean
}) {
  return (
    <Card
      className={`p-6 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${
        selected ? "ring-2 ring-primary bg-accent" : ""
      }`}
      onClick={onClick}
    >
      <div className="space-y-1">
        <div className="font-medium text-lg">{label}</div>
        {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
      </div>
    </Card>
  )
}
