"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

type GiftState = {
  ageGroup: string
  gender: string
  relationship: string
  occasion: string
  lifestyle: string
  budget: string
}

export default function FlowPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [state, setState] = useState<GiftState>({
    ageGroup: "",
    gender: "",
    relationship: "",
    occasion: "",
    lifestyle: "",
    budget: "",
  })

  const ageGroupOptions = [
    { value: "kids", label: "Kids (8–15 years)" },
    { value: "teens", label: "Teens (15–22 years)" },
    { value: "young-adult", label: "Young Adult (23–29 years)" },
    { value: "genx-millennials", label: "Gen X / Millennials (30–45 years)" },
    { value: "adults", label: "Adults (50–60 years)" },
    { value: "old-age", label: "Old Age (60+ years)" },
  ]

  const genderOptions = [
    { value: "female", label: "Female" },
    { value: "male", label: "Male" },
    { value: "neutral", label: "Neutral / Prefer not to say" },
  ]

  const totalSteps = 5
  const progress = (step / totalSteps) * 100

  const handleSelection = (key: keyof GiftState, value: string, shouldAdvance = true) => {
    const nextState = { ...state, [key]: value }
    setState(nextState)

    if (!shouldAdvance) return

    if (step < totalSteps) {
      setTimeout(() => setStep(step + 1), 300)
    } else {
      setTimeout(() => {
        sessionStorage.setItem("giftState", JSON.stringify(nextState))
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
    // Kids and teens get age-specific options
    if (state.ageGroup === "kids") {
      return [
        { label: "Birthday", value: "birthday" },
        { label: "Good grades / exam results", value: "exam-results" },
        { label: "School competition / sports", value: "school-event" },
        { label: "Just to make them happy", value: "special" },
        { label: "Festival / celebration", value: "wedding" },
      ]
    }

    if (state.ageGroup === "teens") {
      const teenOptions = [
        { label: "Birthday", value: "birthday" },
        { label: "Board exam results / achievement", value: "exam-results" },
        { label: "College admission / milestone", value: "congratulations" },
        { label: "Just to make them feel special", value: "special" },
      ]
      // Add partner-specific occasion for teens if partner is selected
      if (state.relationship === "partner") {
        teenOptions.push({ label: "Anniversary / special day", value: "anniversary" })
      }
      return teenOptions
    }

    // Adults get standard options
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
    const youthfulBands = ["kids", "teens", "young-adult", "genx-millennials"]

    if (youthfulBands.includes(state.ageGroup)) {
      if (state.ageGroup === "kids") {
        return {
          prompt: "What do they love doing most?",
          options: [
            { label: "Playing or outdoor fun", value: "play" },
            { label: "Toys, crafts or building things", value: "crafts" },
            { label: "Cartoons, comics or games", value: "games" },
            { label: "Books, puzzles or learning kits", value: "learning" },
          ],
        }
      }

      if (state.ageGroup === "teens") {
        return {
          prompt: "What’s their weekend vibe?",
          options: [
            { label: "At a café / aesthetic place", value: "cafe" },
            { label: "Working or hustling", value: "working" },
            { label: "In pyjamas watching Netflix", value: "netflix" },
            { label: "Out socialising", value: "socialising" },
          ],
        }
      }

      const teenAdultOptions = [
        { label: "At a café / aesthetic place", value: "cafe" },
        { label: "Working or hustling", value: "working" },
        { label: "In pyjamas watching Netflix", value: "netflix" },
        { label: "Out socialising", value: "socialising" },
      ]

      return {
        prompt: "What best matches their vibe?",
        options: teenAdultOptions,
      }
    }

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
              <h2 className="text-3xl md:text-4xl font-bold text-balance">Start with age and gender</h2>
              <p className="text-muted-foreground">This helps us keep things relevant and age-appropriate.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ageGroupOptions.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    onClick={() => handleSelection("ageGroup", option.value, false)}
                    selected={state.ageGroup === option.value}
                  />
                ))}
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-foreground">Gender</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {genderOptions.map((option) => (
                    <OptionCard
                      key={option.value}
                      label={option.label}
                      onClick={() => handleSelection("gender", option.value, false)}
                      selected={state.gender === option.value}
                    />
                  ))}
                </div>
              </div>

              <Button
                className="mt-2 w-full sm:w-auto"
                disabled={!state.ageGroup || !state.gender}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-balance">
                {state.ageGroup === "kids" || state.ageGroup === "teens"
                  ? "Who is this gift for?"
                  : "Who do you want to gift?"}
              </h2>
              <p className="text-muted-foreground">
                {state.ageGroup === "kids" || state.ageGroup === "teens"
                  ? "Tell us their role so we can keep it age-appropriate."
                  : "Choose the relationship to tailor the vibe."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {state.ageGroup === "kids" ? (
                  // Kids: simplified options
                  <>
                    <OptionCard
                      label="School Friend"
                      onClick={() => handleSelection("relationship", "friend")}
                      selected={state.relationship === "friend"}
                    />
                    <OptionCard
                      label="Brother / Sister"
                      onClick={() => handleSelection("relationship", "parent")}
                      selected={state.relationship === "parent"}
                    />
                    <OptionCard
                      label="Parent / Family"
                      onClick={() => handleSelection("relationship", "parent")}
                      selected={state.relationship === "parent"}
                    />
                    <OptionCard
                      label="Classmate / Cousin"
                      onClick={() => handleSelection("relationship", "friend")}
                      selected={state.relationship === "friend"}
                    />
                  </>
                ) : state.ageGroup === "teens" ? (
                  // Teens: age-appropriate options
                  <>
                    <OptionCard
                      label="Best Friend"
                      onClick={() => handleSelection("relationship", "friend")}
                      selected={state.relationship === "friend"}
                    />
                    <OptionCard
                      label="Sibling"
                      onClick={() => handleSelection("relationship", "parent")}
                      selected={state.relationship === "parent"}
                    />
                    <OptionCard
                      label="Parent / Family"
                      onClick={() => handleSelection("relationship", "parent")}
                      selected={state.relationship === "parent"}
                    />
                    <OptionCard
                      label="Crush / Partner"
                      onClick={() => handleSelection("relationship", "partner")}
                      selected={state.relationship === "partner"}
                    />
                  </>
                ) : (
                  // Adults: all options
                  <>
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
                  </>
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-balance">
                {state.ageGroup === "kids" || state.ageGroup === "teens"
                  ? "What are you celebrating?"
                  : "What's the occasion?"}
              </h2>
              <p className="text-muted-foreground">
                {state.ageGroup === "kids" || state.ageGroup === "teens"
                  ? "Helps us pick gifts that feel right for their stage."
                  : "We’ll match the gift to the moment."}
              </p>
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
              <h2 className="text-3xl md:text-4xl font-bold text-balance">
                {state.ageGroup === "kids" || state.ageGroup === "teens"
                  ? "Pick a budget that feels right"
                  : "What feels right for this gift?"}
              </h2>
              <p className="text-muted-foreground">
                {state.ageGroup === "kids" || state.ageGroup === "teens"
                  ? "We’ll stay within this range and keep it thoughtful."
                  : "Choose the range that matches how you want this to feel."}
              </p>
              <div className="grid grid-cols-1 gap-4">
                {state.ageGroup === "kids" || state.ageGroup === "teens" ? (
                  <>
                    <OptionCard
                      label="Sweet & Thoughtful"
                      subtitle="₹500–₹1,000"
                      onClick={() => handleSelection("budget", "safe")}
                      selected={state.budget === "safe"}
                    />
                    <OptionCard
                      label="Really Special"
                      subtitle="₹1,000–₹2,000"
                      onClick={() => handleSelection("budget", "premium")}
                      selected={state.budget === "premium"}
                    />
                    <OptionCard
                      label="Super Awesome"
                      subtitle="₹2,000+"
                      onClick={() => handleSelection("budget", "all-out")}
                      selected={state.budget === "all-out"}
                    />
                  </>
                ) : (
                  <>
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
                  </>
                )}
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
