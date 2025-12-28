# Technical Documentation: InstantGift Platform

## Document Information
**Version:** 1.0  
**Last Updated:** 28 December 2025  
**Application Name:** InstantGift - AI-Powered Gift Curation Platform  
**Project Type:** Next.js Frontend Application with Integrated AI Backend  

---

## 1. High-Level Overview

### 1.1 Problem Statement
InstantGift solves the problem of last-minute gift selection paralysis. Users often struggle to find thoughtful, contextually appropriate gifts under time pressure. The platform eliminates this friction by using AI to understand the recipient's profile (relationship, age, lifestyle, occasion) and generating highly personalized gift recommendations in under 60 seconds.

### 1.2 Target Users
- **Primary Users**: Individuals needing to purchase gifts quickly (friends, family, partners, colleagues)
- **Use Cases**: Birthdays, anniversaries, congratulations, period care, welcome gifts, or "just because" occasions
- **Geographic Focus**: Indian market (pricing in INR, culturally relevant recommendations)

### 1.3 Core Capabilities
1. **AI-Driven Gift Curation**: Uses Google Gemini or Grok AI to generate contextually intelligent gift recommendations
2. **Dynamic Profiling**: Adapts questioning logic based on recipient generation and relationship
3. **Visual Enhancement**: Automatically fetches relevant product images via Unsplash API
4. **Delivery Management**: Captures delivery preferences, addresses, and personal notes
5. **Multi-Step Flow**: Guided questionnaire → AI processing → Recommendations → Delivery → Confirmation

---

## 2. Tech Stack Overview

### 2.1 Frontend Framework
- **Framework**: Next.js 16.0.10 (App Router architecture)
- **React Version**: 19.2.0
- **TypeScript**: Version 5 (strict mode enabled)
- **Rendering Strategy**: 
  - Server-side rendering for landing page
  - Client-side rendering for interactive flows (`"use client"` directive)
  
### 2.2 Styling & UI Components
- **CSS Framework**: Tailwind CSS 4.1.9 with custom color scheme
- **UI Component Library**: Radix UI primitives (shadcn/ui design system)
- **Animation**: tailwindcss-animate + tw-animate-css
- **Design System**: "New York" style from shadcn/ui
- **Color Scheme**: Warm, premium palette optimized for gifting context
- **Typography**: Geist & Geist Mono fonts (Google Fonts)
- **Icons**: lucide-react (v0.454.0)

### 2.3 State Management
- **Pattern**: Local state with React hooks (`useState`, `useEffect`)
- **Persistence**: `sessionStorage` for cross-page state
- **Data Flow**: Unidirectional (Component → sessionStorage → Next Component)
- **No Global State Manager**: Application simplicity allows local state sufficiency

### 2.4 Backend & API
- **Runtime**: Node.js (via Next.js API Routes)
- **API Style**: RESTful endpoints under `/app/api/`
- **Route**: `POST /api/recommendations` - sole backend endpoint
- **AI Integration**: 
  - Google Gemini 2.0 Flash (via `@google/generative-ai` SDK)
  - X.AI Grok-3 (fallback/alternative via REST API)
- **Image Service**: Unsplash API for product photography

### 2.5 External Services & APIs

| Service | Purpose | Authentication | Configuration |
|---------|---------|----------------|---------------|
| **Google Gemini AI** | Gift recommendation generation | API Key | `GEMINI_API_KEY` |
| **X.AI Grok** | Alternative AI provider | API Key | `GROK_API_KEY` |
| **Unsplash API** | Product image retrieval | Client ID | `UNSPLASH_ACCESS_KEY` |
| **Vercel Analytics** | Frontend performance tracking | Auto-configured | N/A |

### 2.6 Package Management & Build Tools
- **Package Manager**: pnpm (evidenced by `pnpm-lock.yaml`)
- **Build System**: Next.js built-in Turbopack/Webpack
- **PostCSS**: Configured via `@tailwindcss/postcss`

---

## 3. Project Structure Breakdown

```
gifting-platform-frontend/
│
├── app/                          # Next.js App Router directory
│   ├── layout.tsx                # Root layout with metadata, fonts, analytics
│   ├── page.tsx                  # Landing page (homepage)
│   ├── globals.css               # Global Tailwind styles + color scheme
│   │
│   ├── flow/                     # Step-by-step questionnaire flow
│   │   └── page.tsx              # 5-step interactive form
│   │
│   ├── loading/                  # Transition screen during AI processing
│   │   └── page.tsx              # Animated loading state (3s delay)
│   │
│   ├── recommendations/          # AI-generated gift results
│   │   └── page.tsx              # Displays 3 products + 2 gift cards
│   │
│   ├── delivery/                 # Delivery details collection
│   │   └── page.tsx              # Form for date, time, address, personal note
│   │
│   ├── confirmation/             # Order review before submission
│   │   └── page.tsx              # Summary of gift + delivery details
│   │
│   ├── success/                  # Post-order confirmation
│   │   └── page.tsx              # Success message with call-to-action
│   │
│   └── api/                      # Backend API routes
│       └── recommendations/
│           └── route.ts          # POST endpoint for AI recommendations
│
├── components/                   # React components
│   ├── theme-provider.tsx        # Dark mode support (unused currently)
│   └── ui/                       # shadcn/ui component library (56 components)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── progress.tsx
│       ├── ... (53 more)
│
├── lib/                          # Utility functions
│   ├── utils.ts                  # cn() utility for Tailwind class merging
│   └── mock-api.ts               # Client-side API wrapper for recommendations
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts             # Mobile breakpoint detection
│   └── use-toast.ts              # Toast notification system
│
├── public/                       # Static assets (icons, images)
│
├── styles/                       # Additional style directories
│   └── globals.css               # Duplicate/legacy global styles
│
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.mjs               # Next.js configuration (TypeScript errors ignored, images unoptimized)
├── postcss.config.mjs            # PostCSS configuration for Tailwind
├── components.json               # shadcn/ui configuration
└── .env                          # Environment variables (API keys)
```

### 3.1 Folder Responsibilities

#### `/app` Directory
- **Purpose**: Next.js 13+ App Router structure
- **Key Pattern**: Each subfolder represents a route (`/flow` → `app/flow/page.tsx`)
- **Layout**: `layout.tsx` wraps all pages with common HTML structure
- **API Routes**: `app/api/` contains server-side API endpoints

#### `/components/ui` Directory
- **Purpose**: Reusable UI primitives from shadcn/ui library
- **Pattern**: Each component is self-contained, built on Radix UI
- **Examples**: `button.tsx`, `card.tsx`, `input.tsx`, `progress.tsx`
- **Interaction**: Imported directly by page components

#### `/lib` Directory
- **Purpose**: Utility functions and API clients
- **`utils.ts`**: Single `cn()` function for conditional class merging using `clsx` + `tailwind-merge`
- **`mock-api.ts`**: Client-side wrapper for `/api/recommendations` endpoint

#### `/hooks` Directory
- **Purpose**: Reusable React hooks
- **`use-mobile.ts`**: Detects mobile viewport breakpoints
- **`use-toast.ts`**: Toast notification system (Sonner integration)

---

## 4. Application Flow (End-to-End)

### 4.1 User Journey Map

```
[Landing Page] 
    ↓ Click "Find the perfect gift"
[5-Step Questionnaire]
    ↓ Complete all questions (auto-advance)
[Loading Screen] (3 seconds)
    ↓ AI processing + image fetching
[Recommendations Page] (5 gifts shown)
    ↓ Select a gift
[Delivery Details Form]
    ↓ Fill date, time, address, note
[Confirmation Page]
    ↓ Review and confirm
[Success Page]
```

### 4.2 Detailed Flow Breakdown

#### **Step 1: Landing Page** (`/app/page.tsx`)
- **Route**: `/`
- **Purpose**: Marketing entry point
- **Actions**: 
  - User clicks "Find the perfect gift" button
  - Navigates to `/flow`
- **Key Components**: 
  - Hero section with value propositions
  - Feature grid (60s, AI-Curated, Same Day)
- **State**: No state management

#### **Step 2: Questionnaire Flow** (`/app/flow/page.tsx`)
- **Route**: `/flow`
- **Purpose**: Collect recipient profile data
- **State Management**: 
  ```typescript
  type GiftState = {
    relationship: string    // friend/colleague/parent/partner
    occasion: string        // birthday/anniversary/congratulations/etc.
    generation: string      // gen-z/millennial/gen-x/elder
    lifestyle: string       // cafe/working/netflix/socialising
    budget: string          // safe/premium/all-out
  }
  ```
- **Question Logic**: 
  - **Q1**: Relationship selection (4 options)
  - **Q2**: Occasion (dynamic options based on relationship)
  - **Q3**: Generation bracket (4 age ranges)
  - **Q4**: Lifestyle vibe (dynamic questions based on generation)
  - **Q5**: Budget preference (3 tiers)
- **Dynamic Branching**: 
  - If relationship = "partner" or "parent" → shows "Anniversary" option
  - If relationship = "colleague" → shows "Welcome to the team" option
  - If relationship = "partner" → shows "Period care" option
  - If generation = "gen-z" or "millennial" → Saturday night vibe questions
  - If generation = "gen-x" or "elder" → Ritual/routine questions
- **Progression**: 
  - Auto-advances after each selection (300ms delay)
  - Back button available for previous question
  - Progress bar shows completion percentage
- **Final Action**: 
  - Saves `GiftState` to `sessionStorage`
  - Navigates to `/loading`

#### **Step 3: Loading Screen** (`/app/loading/page.tsx`)
- **Route**: `/loading`
- **Purpose**: Visual feedback during AI processing
- **Duration**: 3 seconds (hardcoded timeout)
- **Animation**: Sparkles + spinner icons with loading messages
- **Messages**: 
  - "Understanding their vibe…"
  - "Matching personality to something meaningful…"
  - "Curating the perfect gifts…"
- **Final Action**: Auto-redirect to `/recommendations`

#### **Step 4: AI Recommendations** (`/app/recommendations/page.tsx`)
- **Route**: `/recommendations`
- **Data Source**: 
  1. Reads `giftState` from `sessionStorage`
  2. Calls `fetchRecommendations(giftState)` from `/lib/mock-api.ts`
  3. API wrapper sends POST to `/api/recommendations`
- **API Call**: 
  ```typescript
  POST /api/recommendations
  Body: { relationship, occasion, generation, lifestyle, budget }
  Response: [
    { id, name, image, reasoning, priceRange }, 
    ... (5 items total)
  ]
  ```
- **Display Logic**: 
  - First 3 items: Physical product cards
  - Items 4-5: Gift card/subscription cards
- **User Actions**: 
  - Click "Select this gift" → saves to `sessionStorage.selectedGift`
  - Click "Refresh recommendations" → re-calls API
- **Navigation**: Clicking any gift → `/delivery`

#### **Step 5: Delivery Details** (`/app/delivery/page.tsx`)
- **Route**: `/delivery`
- **Purpose**: Capture delivery logistics
- **Form Fields**: 
  ```typescript
  {
    deliveryDate: string     // HTML date picker (min: today)
    deliveryTime: string     // Dropdown: morning/afternoon/evening
    address: string          // Textarea (required)
    personalNote: string     // Textarea (optional)
  }
  ```
- **Validation**: Browser-native HTML5 validation (required attributes)
- **State Management**: 
  - Reads `selectedGift` from `sessionStorage` (or redirects to `/recommendations`)
  - On submit: Saves `deliveryData` to `sessionStorage`
- **Navigation**: On submit → `/confirmation`

#### **Step 6: Confirmation Review** (`/app/confirmation/page.tsx`)
- **Route**: `/confirmation`
- **Purpose**: Final review before order placement
- **Data Display**: 
  - Selected gift details (name, image, reasoning, price)
  - Delivery date (formatted: "Monday, December 28, 2025")
  - Time slot (human-readable: "Morning 9 AM - 12 PM")
  - Full address
  - Personal note (if provided)
- **Actions**: 
  - "Place Order" button → Mock API call → Navigate to `/success`
  - Back button → Return to `/delivery`

#### **Step 7: Success Page** (`/app/success/page.tsx`)
- **Route**: `/success`
- **Purpose**: Order confirmation
- **Display**: 
  - Success icon + message ("You just made someone's day 💛")
  - Estimated delivery reminder
  - Email confirmation note
  - "Send another gift" link → Returns to `/`

---

## 5. API Documentation

### 5.1 Recommendations Endpoint

**Route**: `/api/recommendations`  
**Method**: `POST`  
**Runtime**: Node.js (Next.js API Route)  
**Handler**: `app/api/recommendations/route.ts`

#### 5.1.1 Request Payload
```typescript
{
  relationship: "friend" | "colleague" | "parent" | "partner",
  occasion: "birthday" | "anniversary" | "congratulations" | "wedding" | "special" | "welcome" | "period-care",
  generation: "gen-z" | "millennial" | "gen-x" | "elder",
  lifestyle: "cafe" | "working" | "netflix" | "socialising" | "cooking" | "morning" | "decor" | "hobbies",
  budget: "safe" | "premium" | "all-out"
}
```

#### 5.1.2 Response Payload (Success)
```typescript
[
  {
    id: string,           // Unique identifier
    name: string,         // Product name (e.g., "Personalized Photo Frame")
    image: string,        // Unsplash image URL
    reasoning: string,    // 1-2 sentence explanation
    priceRange: string    // INR format (e.g., "₹1,200 - ₹1,800")
  },
  // ... 4 more items (total 5)
]
```

#### 5.1.3 Error Responses
```typescript
// Missing API Keys
{ error: "Missing GEMINI_API_KEY" | "Missing GROK_API_KEY", status: 500 }

// Invalid Request Body
{ error: "Invalid JSON body", status: 400 }

// AI Provider Failure
{ 
  error: "GEMINI request failed" | "GROK request failed", 
  details: string, 
  model: string, 
  provider: string,
  status: 502 
}

// Insufficient Recommendations
{ 
  error: "AI returned insufficient recommendations", 
  raw: string (truncated to 800 chars),
  status: 502 
}

// JSON Parsing Failure
{ 
  error: "Failed to parse AI response", 
  raw: string (truncated to 800 chars),
  status: 502 
}
```

#### 5.1.4 AI Processing Flow

```
1. Validate environment variables (API keys)
2. Parse request body → GiftState
3. Construct AI prompt with Dynamic Branching Protocol
4. Call AI provider (Grok or Gemini):
   - Grok: POST https://api.x.ai/v1/chat/completions
   - Gemini: GoogleGenerativeAI SDK
5. Extract JSON from AI response (handles markdown, objects, arrays)
6. Coerce response into Recommendation[] format
7. For each recommendation:
   - Call fetchUnsplashImage(productName)
   - Merge image URL into recommendation object
8. Return final 5 recommendations with images
```

#### 5.1.5 Dynamic Branching Protocol
The AI prompt implements three distinct profiling tracks:

**Track A: Digital Native** (Gen Z / Young Millennial)
- Focus: Identity, aesthetics, lifestyle signaling
- Signals: Saturday night behavior, visual identity, occasion
- Gift characteristics: Instagram-worthy, emotion-forward, identity-expressive

**Track B: Classic Soul** (Parents / Older Generation)
- Focus: Rituals, comfort, nostalgia, quality of life
- Signals: 5 PM ritual proxy, common complaints, occasion
- Gift characteristics: Practical, familiar, emotionally warm, culturally appropriate

**Track C: Corporate** (Boss / Colleague)
- Focus: Safety, status, utility, neutrality
- Signals: Desk persona, occasion
- Gift characteristics: Professional, tasteful, office-appropriate

#### 5.1.6 Unsplash Image Fetching

**Function**: `fetchUnsplashImage(productName: string)`  
**Purpose**: Fetch relevant product images for recommendations  
**API**: `GET https://api.unsplash.com/search/photos`  
**Parameters**:
- `query`: Sanitized product name
- `per_page`: 1
- `orientation`: portrait

**Query Sanitization Logic**:
1. Remove prefixes: "personalized", "customized", "premium", "luxury", etc.
2. Remove suffixes: "set", "kit", "pack", "box", "bundle", etc.
3. Handle gift cards: Extract category (e.g., "Spa Gift Card" → "luxury spa salon interior")
4. Handle subscriptions: Extract service (e.g., "Spotify Subscription" → "music streaming headphones")
5. Fallback: Use first significant word if primary search fails

**Error Handling**: Returns empty string on failure (non-blocking)

---

## 6. State & Data Flow

### 6.1 State Management Architecture

**Pattern**: Ephemeral Session State  
**Storage Mechanism**: Browser `sessionStorage` API  
**Persistence**: Lost on tab close (intentional for privacy)  
**Flow Direction**: Unidirectional

### 6.2 State Keys

| Key | Type | Set By | Read By | Purpose |
|-----|------|--------|---------|---------|
| `giftState` | `GiftState` | `/flow` | `/loading`, `/recommendations` | Stores user's questionnaire answers |
| `selectedGift` | `Recommendation` | `/recommendations` | `/delivery`, `/confirmation` | Stores chosen gift |
| `deliveryData` | `DeliveryData` | `/delivery` | `/confirmation` | Stores delivery preferences |

### 6.3 Data Flow Diagram

```
┌─────────────┐
│   /flow     │
│             │
│ User inputs │
│ 5 questions │
└──────┬──────┘
       │ sessionStorage.setItem('giftState', ...)
       ↓
┌─────────────┐
│  /loading   │
│             │
│ 3s timeout  │
└──────┬──────┘
       │ sessionStorage.getItem('giftState')
       ↓
┌─────────────────────┐
│ /recommendations    │
│                     │
│ POST /api/recommendations
│      ↓              │
│   [AI Processing]  │
│      ↓              │
│ Display 5 gifts    │
└──────┬──────────────┘
       │ sessionStorage.setItem('selectedGift', ...)
       ↓
┌─────────────┐
│  /delivery  │
│             │
│ Form inputs │
└──────┬──────┘
       │ sessionStorage.setItem('deliveryData', ...)
       ↓
┌─────────────────┐
│ /confirmation   │
│                 │
│ Review & submit │
└──────┬──────────┘
       │ Mock order placement
       ↓
┌─────────────┐
│  /success   │
│             │
│ Confirmation│
└─────────────┘
```

### 6.4 Data Retrieval Pattern

All page components follow this pattern:
```typescript
useEffect(() => {
  const dataJson = sessionStorage.getItem('keyName')
  if (!dataJson) {
    // Handle missing data (redirect or show error)
    return
  }
  try {
    const data = JSON.parse(dataJson)
    setState(data)
  } catch {
    // Handle parse error
  }
}, [])
```

### 6.5 Cache & Refresh Mechanism

- **Recommendations Refresh**: 
  - Clicking "Refresh recommendations" re-calls `/api/recommendations`
  - Same `giftState` parameters, new AI response
  - New Unsplash images fetched
- **No Client-Side Caching**: Every API call is fresh (no SWR or React Query)
- **No Backend Persistence**: No database, no user accounts, no order storage

---

## 7. Configuration & Environment Variables

### 7.1 Environment Variables

**File Location**: `.env` (root directory)  
**Loaded By**: Next.js automatically (server-side only)

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `AI_PROVIDER` | No | `"grok"` | Selects AI provider: `"gemini"` or `"grok"` |
| `GEMINI_API_KEY` | Yes* | N/A | Google Gemini API authentication |
| `GEMINI_MODEL` | No | `"gemini-2.0-flash"` | Gemini model name |
| `GROK_API_KEY` | Yes* | N/A | X.AI Grok API authentication |
| `UNSPLASH_ACCESS_KEY` | Yes | N/A | Unsplash image search client ID |

*Required if `AI_PROVIDER` is set to that provider

### 7.2 Example Configuration (Use Your Own Keys)

```bash
# Replace these with your actual API keys
GEMINI_API_KEY=your_gemini_api_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
GROK_API_KEY=your_grok_api_key_here
```

> ⚠️ **SECURITY WARNING**: Never commit real API keys to version control. Use `.env.local` for local development and configure secrets in your hosting platform (e.g., Vercel Environment Variables).

### 7.3 Next.js Configuration (`next.config.mjs`)

```javascript
{
  typescript: {
    ignoreBuildErrors: true  // ⚠️ PRODUCTION RISK: Skips TypeScript validation
  },
  images: {
    unoptimized: true        // ⚠️ PERFORMANCE RISK: Disables Next.js image optimization
  }
}
```

### 7.4 TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "strict": true,           // Strict type checking enabled
    "target": "ES6",
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",       // React 17+ JSX transform
    "paths": {
      "@/*": ["./*"]          // Absolute imports from root
    }
  }
}
```

### 7.5 Tailwind Configuration (Implicit)

- **Config File**: None (using Tailwind CSS 4's built-in configuration)
- **Theme**: Defined via CSS variables in `app/globals.css`
- **Plugins**: `tw-animate-css` for animations
- **Custom Variants**: `dark` mode support (via `@custom-variant`)

### 7.6 shadcn/ui Configuration (`components.json`)

```json
{
  "style": "new-york",       // Design system variant
  "rsc": true,               // React Server Components enabled
  "tsx": true,
  "tailwind": {
    "baseColor": "neutral",
    "cssVariables": true     // Uses CSS variables for theming
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  },
  "iconLibrary": "lucide"    // Icon system
}
```

### 7.7 Runtime Environments

- **Development**: `pnpm dev` (Next.js dev server on port 3000)
- **Production**: `pnpm build` → `pnpm start`
- **No Staging Environment**: Configuration is unified (no environment-specific overrides)

---

## 8. Security & Access Control

### 8.1 Authentication & Authorization

**Current Implementation**: None  
**User Sessions**: No user accounts or authentication system  
**Access Control**: Public access to all routes  

### 8.2 API Security

#### 8.2.1 Rate Limiting
- **Status**: Not implemented
- **Risk**: API abuse possible (especially AI endpoint which incurs costs)
- **Recommendation**: Implement rate limiting middleware (e.g., `@upstash/ratelimit`)

#### 8.2.2 API Key Protection
- **Storage**: Environment variables (server-side only)
- **Exposure**: API keys never sent to client
- **Validation**: Keys checked before AI calls, returns 500 if missing

#### 8.2.3 Input Validation
- **Request Body**: No schema validation (Zod available but unused)
- **Type Coercion**: Manual TypeScript casting
- **XSS Protection**: React's built-in escaping for user inputs
- **SQL Injection**: Not applicable (no database)

#### 8.2.4 CORS Policy
- **Configuration**: Next.js default (same-origin)
- **External Requests**: 
  - Unsplash API: CORS-enabled by provider
  - X.AI Grok API: Server-side call (no CORS issue)

### 8.3 Data Privacy

#### 8.3.1 User Data Handling
- **Storage**: Browser `sessionStorage` only (no server persistence)
- **Transmission**: HTTPS-only (enforced by hosting)
- **Retention**: Cleared on browser tab close
- **Third-Party Sharing**: None (Unsplash only receives product names)

#### 8.3.2 Personal Information
- **Collected Data**: 
  - Delivery address (not stored server-side)
  - Personal note (not stored server-side)
  - Gift preferences (not stored server-side)
- **PII Handling**: No backend storage, no analytics tracking of personal data

#### 8.3.3 AI Data Processing
- **Gemini API**: Google's privacy policy applies (data sent to Google servers)
- **Grok API**: X.AI's privacy policy applies (data sent to X.AI servers)
- **Data Sent**: User's questionnaire answers + AI prompt
- **Data Retention**: Provider-dependent (check respective privacy policies)

### 8.4 Known Security Vulnerabilities

| Issue | Severity | Impact | Mitigation |
|-------|----------|--------|------------|
| No rate limiting | High | API cost abuse, DoS | Implement request throttling |
| TypeScript errors ignored | Medium | Runtime errors in production | Remove `ignoreBuildErrors: true` |
| No input sanitization | Medium | Potential injection attacks | Add Zod schema validation |
| API keys in `.env` file | Low | Git exposure risk | Use `.env.local` or secret managers |
| No CSRF protection | Low | Limited risk (no state mutations) | Add CSRF tokens if adding user accounts |

---

## 9. Error Handling & Logging

### 9.1 Frontend Error Handling

#### 9.1.1 Data Fetching Errors
**Pattern**: Try-catch with fallback
```typescript
try {
  const recs = await fetchRecommendations(giftState)
  setRecommendations(recs)
} catch {
  setRecommendations([])  // Silent failure, empty array
}
```
**Issue**: No user notification on error

#### 9.1.2 Missing State Errors
**Pattern**: Guard clauses with redirect
```typescript
if (!selectedGift) {
  return (
    <div>
      <p>No gift selected</p>
      <Link href="/recommendations"><Button>Back</Button></Link>
    </div>
  )
}
```

#### 9.1.3 Form Validation Errors
**Pattern**: HTML5 native validation
- `required` attributes on inputs
- `min` date validation
- Browser-native error messages (not customized)

### 9.2 Backend Error Handling

#### 9.2.1 API Route Errors (`/api/recommendations/route.ts`)

**Environment Variable Errors**:
```typescript
if (!geminiApiKey) {
  return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 })
}
```

**JSON Parse Errors**:
```typescript
try {
  state = await req.json()
} catch {
  return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
}
```

**AI Provider Errors**:
```typescript
try {
  const result = await model.generateContent(prompt)
} catch (error) {
  const details = error instanceof Error ? error.message : String(error)
  return NextResponse.json(
    { error: "AI request failed", details, model, provider },
    { status: 502 }
  )
}
```

**Insufficient Data Errors**:
```typescript
if (recommendations.length < 5) {
  return NextResponse.json(
    { error: "AI returned insufficient recommendations", raw: responseText.slice(0, 800) },
    { status: 502 }
  )
}
```

#### 9.2.2 Unsplash API Errors
**Pattern**: Silent failure (returns empty string)
```typescript
try {
  const response = await fetch(unsplashUrl)
  if (!response.ok) {
    console.error(`Unsplash API error: ${response.status}`)
    return ""  // Non-blocking failure
  }
} catch (error) {
  console.error("Error fetching Unsplash image:", error)
  return ""
}
```

### 9.3 Logging Strategy

#### 9.3.1 Frontend Logging
- **Console Errors**: Used for API failures
- **Analytics**: Vercel Analytics (performance metrics only, no custom events)
- **Error Tracking**: Not implemented (no Sentry/Bugsnag)

#### 9.3.2 Backend Logging
- **Destination**: Server console (stdout/stderr)
- **Logged Events**:
  - Unsplash API errors (`console.error`)
  - Missing environment variables (`console.error`)
  - AI response parsing failures (via error responses)
- **Log Format**: Plain text (no structured logging)
- **Production Logs**: Hosted on Vercel (available in Vercel dashboard)

### 9.4 Retry Mechanisms

**Current Implementation**: None  
- No automatic retries for failed API calls
- User must manually refresh or restart flow
- Unsplash failures silently fallback to empty images

### 9.5 Fallback Strategies

| Scenario | Fallback |
|----------|----------|
| Unsplash image fetch fails | Display empty image (broken src) |
| AI returns < 5 recommendations | Return 502 error (no partial display) |
| sessionStorage missing data | Redirect to previous step with message |
| Network timeout | Browser-native error (no custom handling) |

---

## 10. Deployment & Runtime

### 10.1 Build Process

#### 10.1.1 Development Build
```bash
pnpm dev
# Starts Next.js dev server
# Port: 3000 (default)
# Hot reload: Enabled
# Source maps: Enabled
```

#### 10.1.2 Production Build
```bash
pnpm build
# Output: .next/ directory
# Static optimization: Server components pre-rendered
# API routes: Bundled as serverless functions
# TypeScript errors: Ignored (⚠️ due to next.config.mjs)
```

#### 10.1.3 Production Server
```bash
pnpm start
# Serves .next/ build
# Requires prior `pnpm build`
# Port: 3000 (default)
```

### 10.2 Hosting Platform

**Inferred Platform**: Vercel  
**Evidence**:
- `@vercel/analytics` package installed
- `next.config.mjs` optimized for Vercel deployment
- No custom server configuration

**Deployment Configuration**:
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`
- **Environment Variables**: Set in Vercel dashboard (must mirror `.env`)

### 10.3 Runtime Requirements

#### 10.3.1 Node.js Version
- **Required**: Node.js 18+ (Next.js 16 requirement)
- **Detected From**: `package.json` engines (not specified, assumed latest LTS)

#### 10.3.2 Environment Variables
Must be set in production environment:
- `GEMINI_API_KEY` or `GROK_API_KEY` (depending on `AI_PROVIDER`)
- `UNSPLASH_ACCESS_KEY`
- Optional: `AI_PROVIDER`, `GEMINI_MODEL`

#### 10.3.3 External Dependencies
- **Gemini API**: Requires internet access to `generativelanguage.googleapis.com`
- **Grok API**: Requires internet access to `api.x.ai`
- **Unsplash API**: Requires internet access to `api.unsplash.com`

### 10.4 CI/CD Pipeline

**Status**: Not configured  
**Evidence**: No workflow files (`.github/workflows/`, `.gitlab-ci.yml`, etc.)  

**Recommended Setup**:
1. GitHub Actions workflow for:
   - Linting (`pnpm lint`)
   - Type checking (`tsc --noEmit`)
   - Build verification (`pnpm build`)
   - Automated Vercel deployment

### 10.5 Performance Optimizations

#### 10.5.1 Enabled
- Server-side rendering for static pages (`/`, `/success`)
- Tree-shaking via Next.js bundler
- Code splitting per route
- TailwindCSS purging (automatic in production)

#### 10.5.2 Disabled/Missing
- Next.js Image Optimization (`unoptimized: true` in config)
- Service Workers / PWA features
- Content Delivery Network (CDN) - Vercel provides by default
- Database query optimization (no database)

### 10.6 Monitoring & Observability

**Current Tools**:
- **Vercel Analytics**: Page views, Web Vitals (LCP, FID, CLS)
- **Next.js Built-in**: API route metrics (Vercel dashboard)

**Missing**:
- Error tracking (Sentry, Rollbar)
- Custom event logging
- User behavior analytics (Mixpanel, Amplitude)
- A/B testing framework

---

## 11. How to Extend or Modify Safely

### 11.1 Adding New Pages

#### 11.1.1 Process
1. Create file: `app/new-route/page.tsx`
2. Export default React component
3. Add `"use client"` directive if interactive
4. Link from existing pages: `<Link href="/new-route">...</Link>`

#### 11.1.2 Example
```typescript
// app/gift-history/page.tsx
"use client"

export default function GiftHistoryPage() {
  return <div>Gift History</div>
}
```

### 11.2 Adding New Questionnaire Steps

**Location**: `app/flow/page.tsx`  
**Modifications Required**:

1. **Update `GiftState` type**:
```typescript
type GiftState = {
  // ... existing fields
  newField: string  // Add new field
}
```

2. **Update `totalSteps` constant**:
```typescript
const totalSteps = 6  // Increment
```

3. **Add new step rendering**:
```typescript
{step === 6 && (
  <>
    <h2>New Question?</h2>
    <OptionCard label="Option 1" onClick={() => handleSelection("newField", "value1")} />
  </>
)}
```

4. **Update AI prompt** in `app/api/recommendations/route.ts` to use new field

### 11.3 Modifying AI Behavior

**Location**: `app/api/recommendations/route.ts`  
**Key Function**: `POST` handler (line ~256)

#### 11.3.1 Changing AI Provider
```typescript
// Set environment variable
AI_PROVIDER=gemini  // or "grok"
```

#### 11.3.2 Modifying Prompt
**Location**: Lines 271-422 (the `prompt` constant)  
**Best Practices**:
- Maintain the Dynamic Branching Protocol structure
- Test each track independently (Digital Native, Classic Soul, Corporate)
- Ensure output format instructions remain strict

#### 11.3.3 Adjusting Recommendation Count
**Current**: 5 items (3 products + 2 gift cards)  
**To Change**:
1. Update prompt instructions: "Recommend EXACTLY {N} items"
2. Update validation: `if (recommendations.length < N)`
3. Update frontend display logic in `/recommendations` page

### 11.4 Adding New UI Components

#### 11.4.1 From shadcn/ui Library
```bash
npx shadcn@latest add <component-name>
# Example: npx shadcn@latest add date-picker
```
Component will be added to `components/ui/`

#### 11.4.2 Custom Components
**Location**: `components/` (not in `/ui` subfolder)  
**Pattern**:
```typescript
// components/custom-component.tsx
import { cn } from "@/lib/utils"

export function CustomComponent({ className, ...props }) {
  return <div className={cn("base-classes", className)} {...props} />
}
```

### 11.5 Safe Modification Zones

| Area | Safety Level | Notes |
|------|--------------|-------|
| UI components in `/components/ui` | ⚠️ Medium | May break shadcn updates |
| Page components in `/app/*/page.tsx` | ✅ High | Core business logic |
| AI prompt in `/api/recommendations` | ⚠️ Medium | Test thoroughly, costs incur |
| Tailwind classes in `globals.css` | ✅ High | Visual changes only |
| `sessionStorage` keys | 🔴 Low | Breaking change for users mid-flow |
| TypeScript types | ✅ High | Will catch downstream errors |

### 11.6 Patterns to Follow

#### 11.6.1 State Management
- Use `sessionStorage` for cross-page data
- Parse JSON with try-catch
- Validate data presence before use

#### 11.6.2 Navigation
- Always use Next.js `<Link>` component
- Use `router.push()` for programmatic navigation
- Add back buttons for better UX

#### 11.6.3 Styling
- Use Tailwind utility classes
- Apply `cn()` utility for conditional classes
- Respect existing color scheme variables

#### 11.6.4 API Calls
- Always handle errors with try-catch
- Return structured error objects
- Log errors server-side

### 11.7 Anti-Patterns to Avoid

| Anti-Pattern | Why Avoid | Correct Approach |
|--------------|-----------|------------------|
| Direct DOM manipulation | Breaks React reconciliation | Use state + refs |
| Inline styles | Violates design system | Use Tailwind classes |
| Mixing server/client components | Causes hydration errors | Explicit `"use client"` directives |
| Hardcoded API URLs | Breaks in different environments | Use relative paths (`/api/...`) |
| Unvalidated sessionStorage reads | Runtime errors | Guard clauses + redirects |
| Mutating props | React anti-pattern | Create new objects/arrays |

---

## 12. Known Limitations & Technical Debt

### 12.1 Build Configuration Issues

#### 12.1.1 TypeScript Errors Ignored
**Location**: `next.config.mjs`  
```javascript
typescript: {
  ignoreBuildErrors: true  // ⚠️ CRITICAL ISSUE
}
```
**Impact**: Type errors silently pass to production  
**Risk**: Runtime crashes, unexpected behavior  
**Resolution**: Remove this flag, fix all TypeScript errors

#### 12.1.2 Image Optimization Disabled
**Location**: `next.config.mjs`  
```javascript
images: {
  unoptimized: true
}
```
**Impact**: Slower load times, higher bandwidth usage  
**Risk**: Poor Web Vitals scores, SEO penalty  
**Resolution**: Enable optimization, configure Unsplash domain in `remotePatterns`

### 12.2 Security Vulnerabilities

#### 12.2.1 No Rate Limiting
**Location**: All API routes  
**Impact**: Abuse possible, high API costs  
**Estimated Cost Risk**: Unlimited AI API calls ($$$)  
**Resolution**: Implement `@upstash/ratelimit` or Vercel Edge Middleware

#### 12.2.2 No Input Validation
**Location**: `app/api/recommendations/route.ts`  
**Impact**: Malformed requests can crash backend  
**Resolution**: Add Zod schemas:
```typescript
import { z } from 'zod'

const GiftStateSchema = z.object({
  relationship: z.enum(['friend', 'colleague', 'parent', 'partner']),
  occasion: z.string().min(1),
  generation: z.enum(['gen-z', 'millennial', 'gen-x', 'elder']),
  lifestyle: z.string().min(1),
  budget: z.enum(['safe', 'premium', 'all-out']),
})

const state = GiftStateSchema.parse(await req.json())
```

#### 12.2.3 API Keys in Version Control
**Location**: `.env` file (likely committed)  
**Impact**: Credentials leak if repository is public  
**Resolution**: 
1. Add `.env` to `.gitignore`
2. Use `.env.local` for local development
3. Rotate exposed keys immediately
4. Use Vercel secret manager for production

### 12.3 Error Handling Gaps

#### 12.3.1 Silent Frontend Failures
**Location**: `app/recommendations/page.tsx` (lines 29-36)  
```typescript
try {
  const recs = await fetchRecommendations(giftState)
  setRecommendations(recs)
} catch {
  setRecommendations([])  // User sees empty page, no explanation
}
```
**Impact**: User confusion on failure  
**Resolution**: Add toast notifications using `sonner`

#### 12.3.2 No Retry Logic
**Location**: All API calls  
**Impact**: Transient network errors cause permanent failures  
**Resolution**: Add exponential backoff retries

### 12.4 Scalability Constraints

#### 12.4.1 No Backend Persistence
**Impact**: 
- No order history
- No user accounts
- No analytics on conversions
**Limitation**: Cannot track actual sales or gift deliveries  
**Resolution**: Add database (PostgreSQL, Supabase, or Prisma)

#### 12.4.2 Single AI Provider Dependency
**Impact**: If Grok/Gemini goes down, entire platform fails  
**Resolution**: Implement provider fallback chain:
```typescript
const providers = ['grok', 'gemini', 'claude']
for (const provider of providers) {
  try {
    return await callProvider(provider, prompt)
  } catch {
    continue  // Try next provider
  }
}
throw new Error('All AI providers failed')
```

#### 12.4.3 Session Storage Limitations
**Impact**: Data lost on browser close/refresh  
**Limitation**: Cannot resume interrupted flows  
**Resolution**: 
- Upgrade to `localStorage` for persistence
- Or implement server-side session management

### 12.5 Hardcoded Logic

#### 12.5.1 Budget Tiers
**Location**: `app/flow/page.tsx` (lines 218-237)  
```typescript
<OptionCard label="Safe & Thoughtful" subtitle="₹800–₹1,500" ... />
<OptionCard label="Premium" subtitle="₹1,500–₹3,000" ... />
<OptionCard label="Go all out" subtitle="₹3,000+" ... />
```
**Issue**: Cannot adjust pricing without code change  
**Resolution**: Move to configuration file or CMS

#### 12.5.2 Loading Screen Duration
**Location**: `app/loading/page.tsx` (line 21)  
```typescript
setTimeout(() => {
  router.push('/recommendations')
}, 3000)  // Hardcoded 3 second delay
```
**Issue**: Doesn't reflect actual AI processing time  
**Resolution**: Implement actual API status polling

#### 12.5.3 Occasion Options Logic
**Location**: `app/flow/page.tsx` (function `getOccasionOptions`)  
**Issue**: Complex conditional logic embedded in UI component  
**Resolution**: Extract to utility function or config file

### 12.6 Missing Features

#### 12.6.1 No Payment Integration
**Status**: Order confirmation is mock (no actual purchase)  
**Impact**: Platform cannot generate revenue  
**Required**: Stripe, Razorpay, or similar payment gateway

#### 12.6.2 No Email Notifications
**Status**: Success page mentions email, but none is sent  
**Impact**: Users have no order confirmation  
**Required**: SendGrid, Resend, or transactional email service

#### 12.6.3 No Admin Dashboard
**Status**: No way to view orders, manage inventory, or analyze data  
**Impact**: Cannot operate as actual business  
**Required**: Admin UI (Next.js route) + database

#### 12.6.4 No User Authentication
**Status**: No login/signup system  
**Impact**: Cannot save user profiles or order history  
**Required**: NextAuth.js, Supabase Auth, or Clerk

### 12.7 Code Quality Issues

#### 12.7.1 Unused Dependencies
**Found**: 
- `date-fns` (installed but unused)
- `next-themes` (ThemeProvider exists but not used)
- `react-hook-form` + `@hookform/resolvers` (installed but using native forms)
**Impact**: Larger bundle size  
**Resolution**: Remove unused packages

#### 12.7.2 Duplicate Styles
**Location**: 
- `app/globals.css` (actual global styles)
- `styles/globals.css` (duplicate/legacy)
**Resolution**: Remove `styles/` directory

#### 12.7.3 Magic Numbers
**Examples**:
- `300` ms delay between steps (`app/flow/page.tsx`)
- `3000` ms loading screen (`app/loading/page.tsx`)
- `800` character truncation (`app/api/recommendations/route.ts`)
**Resolution**: Extract to named constants

### 12.8 Technical Debt Priorities

| Issue | Priority | Effort | Impact |
|-------|----------|--------|--------|
| Fix TypeScript errors | 🔴 Critical | High | Prevents production crashes |
| Add rate limiting | 🔴 Critical | Medium | Prevents cost overruns |
| Implement input validation | 🟠 High | Low | Improves stability |
| Add error notifications | 🟠 High | Low | Better UX |
| Remove unused dependencies | 🟡 Medium | Low | Smaller bundle |
| Enable image optimization | 🟡 Medium | Medium | Better performance |
| Add payment integration | 🟢 Low | Very High | Required for monetization |
| Implement retry logic | 🟢 Low | Medium | Better reliability |

---

## 13. ASCII Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER (CLIENT)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Landing Page (/)          ┌──────────────────────────┐         │
│       │                    │   sessionStorage         │         │
│       ↓                    │  ┌────────────────────┐  │         │
│  Questionnaire Flow        │  │ giftState          │  │         │
│    (5 Steps)               │  │ selectedGift       │  │         │
│       │                    │  │ deliveryData       │  │         │
│       ↓                    │  └────────────────────┘  │         │
│  Loading Screen            └──────────────────────────┘         │
│       │                              ↕                           │
│       ↓                         Read/Write                       │
│  Recommendations ←─── POST /api/recommendations                 │
│       │                              │                           │
│       ↓                              │                           │
│  Delivery Form                       │                           │
│       │                              │                           │
│       ↓                              │                           │
│  Confirmation Page                   │                           │
│       │                              │                           │
│       ↓                              │                           │
│  Success Page                        │                           │
│                                      │                           │
└──────────────────────────────────────┼───────────────────────────┘
                                       │
                                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                     NEXT.JS API ROUTE (SERVER)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POST /api/recommendations                                       │
│    │                                                             │
│    ├── Validate Environment Variables                           │
│    │                                                             │
│    ├── Parse Request Body → GiftState                           │
│    │                                                             │
│    ├── Build AI Prompt (Dynamic Branching Protocol)             │
│    │     │                                                       │
│    │     ├── Track A: Digital Native (Gen Z/Millennial)         │
│    │     ├── Track B: Classic Soul (Parents/Older Gen)          │
│    │     └── Track C: Corporate (Colleagues)                    │
│    │                                                             │
│    └── Call AI Provider ┬─→ Google Gemini API                   │
│                         │     (generativelanguage.googleapis.com)│
│                         │                                        │
│                         └─→ X.AI Grok API                        │
│                               (api.x.ai)                         │
│                         ↓                                        │
│    ┌─────────────────────────────────────────┐                  │
│    │  Extract JSON from AI Response          │                  │
│    │  Coerce to Recommendation[] (5 items)   │                  │
│    └─────────────────────────────────────────┘                  │
│                         ↓                                        │
│    For each recommendation:                                      │
│      ├─→ fetchUnsplashImage(productName)                        │
│      │     │                                                     │
│      │     └─→ GET api.unsplash.com/search/photos               │
│      │            (Client-ID authentication)                     │
│      │            ↓                                              │
│      └── Merge image URL into recommendation                    │
│                         ↓                                        │
│    Return: [                                                     │
│      { id, name, image, reasoning, priceRange },                │
│      ... × 5                                                     │
│    ]                                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                       ↑
                                       │
┌──────────────────────────────────────┼───────────────────────────┐
│                 EXTERNAL SERVICES    │                           │
├──────────────────────────────────────┴───────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────┐            │
│  │  Google Gemini API                              │            │
│  │  - Model: gemini-2.0-flash                      │            │
│  │  - Auth: GEMINI_API_KEY                         │            │
│  │  - Response: JSON (structured recommendations)  │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                   │
│  ┌─────────────────────────────────────────────────┐            │
│  │  X.AI Grok API                                  │            │
│  │  - Model: grok-3                                │            │
│  │  - Auth: GROK_API_KEY                           │            │
│  │  - Response: JSON (chat completion format)      │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                   │
│  ┌─────────────────────────────────────────────────┐            │
│  │  Unsplash API                                   │            │
│  │  - Endpoint: /search/photos                     │            │
│  │  - Auth: UNSPLASH_ACCESS_KEY (Client-ID)        │            │
│  │  - Returns: Image URLs (portrait orientation)   │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                   │
│  ┌─────────────────────────────────────────────────┐            │
│  │  Vercel Analytics                               │            │
│  │  - Tracks: Page views, Web Vitals               │            │
│  │  - Integration: Automatic via <Analytics />     │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 14. Quick Reference: File Locations

### 14.1 Key Files for Common Tasks

| Task | File(s) to Modify |
|------|-------------------|
| Change AI prompt logic | `app/api/recommendations/route.ts` (lines 271-422) |
| Add questionnaire step | `app/flow/page.tsx` |
| Modify landing page | `app/page.tsx` |
| Update colors/theme | `app/globals.css` |
| Add new UI component | `components/ui/` (via shadcn CLI) |
| Configure environment | `.env` |
| Adjust Next.js settings | `next.config.mjs` |
| Update dependencies | `package.json` |
| Add utility function | `lib/utils.ts` |
| Modify recommendations display | `app/recommendations/page.tsx` |

### 14.2 Common Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `fetchRecommendations()` | `lib/mock-api.ts` | Client-side API wrapper |
| `fetchUnsplashImage()` | `app/api/recommendations/route.ts` | Image retrieval |
| `cn()` | `lib/utils.ts` | Tailwind class merging |
| `handleSelection()` | `app/flow/page.tsx` | Questionnaire step progression |
| `extractJson()` | `app/api/recommendations/route.ts` | Parse AI responses |
| `coerceRecommendation()` | `app/api/recommendations/route.ts` | Validate recommendation structure |

---

## 15. Getting Started (Developer Onboarding)

### 15.1 Prerequisites
- Node.js 18+ and pnpm installed
- API keys for Gemini/Grok and Unsplash

### 15.2 Setup Steps
```bash
# 1. Clone repository
git clone <repository-url>
cd gifting-platform-frontend

# 2. Install dependencies
pnpm install

# 3. Create .env file
cp .env.example .env  # If example exists, or create manually
# Add your API keys:
# GEMINI_API_KEY=your_key_here
# GROK_API_KEY=your_key_here
# UNSPLASH_ACCESS_KEY=your_key_here

# 4. Start development server
pnpm dev

# 5. Open browser
# Navigate to http://localhost:3000
```

### 15.3 Verification Checklist
- [ ] Landing page loads at `/`
- [ ] Questionnaire flow works (`/flow`)
- [ ] Recommendations appear after completing questionnaire
- [ ] Images load from Unsplash
- [ ] Delivery form accepts input
- [ ] Confirmation page shows summary
- [ ] Success page displays after confirmation

---

## Document End

**Reviewed By**: Internal Engineering Team  
**Distribution**: For internal use only  
**Next Review**: Upon significant architectural changes or major feature additions  

For questions or clarifications, refer to code comments or contact the development team.
