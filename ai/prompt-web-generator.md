# Prompt: Web Generator From Raw Business Text

Use this workflow when the project needs to build or refresh a client website from business notes.

## Objective

Convert the raw business information in `content/raw.txt` into:

1. a structured business brief in `content/brief.yaml`
2. website content that the existing project can render through its current reusable components

If `content/brief.yaml` already exists, refine it in place instead of inventing a parallel workflow.

## Mandatory Rules

- Respect the current project structure.
- Never redesign the site architecture from scratch.
- Never delete existing components to fit new copy.
- Reuse the existing layout, engines, sections, and components.
- Keep responsive behavior intact.
- Use `content/brief.yaml` as the main structured source of truth.
- Preserve the engine architecture already defined in the repository.
- Generate professional marketing copy, not placeholder text.
- Generate clean, conversion-focused copy.
- Make titles feel distinctive and memorable, not generic.
- Push brand clarity, stronger positioning, and sharper CTA language before expanding sections.
- Use the premium strategy, design-system starter, and scorecard targets already present in `content/raw.txt` or `content/brief.yaml` when available.
- Make FAQ answers feel credible, practical, and objection-driven.
- Make testimonials feel natural, specific, and results-aware.
- If information is missing, infer the smallest reasonable default and keep it editable.
- Keep this workflow content-first: prefer updating `content/brief.yaml` over touching layout or component files.
- Keep hero titles to 6-10 words and no more than 2 lines on desktop or mobile.
- Keep section titles to 6-10 words and no more than 2 lines on desktop or mobile.
- Avoid long academic phrasing, corporate filler, and vague abstractions.
- Subtitle copy can be wider than the title if needed for clarity.

## Required Output

The generated brief must support these page types:

- `Landing Page`
- `Website`
- `E-commerce`

The brief must generate or contain:

- hero headline
- hero subtitle
- services
- benefits
- FAQ
- testimonials
- CTA

## Extraction Rules

When reading `content/raw.txt`:

- Extract explicit facts first.
- Normalize the page type to one of the three supported values.
- Infer missing fields only after checking the raw text carefully.
- Keep hero headlines short enough to stay balanced in the existing hero components.
- Keep all title wording concise enough to hold 1 line if short, or 2 balanced lines maximum across desktop and mobile.
- Write concise, high-clarity marketing copy.
- Keep lists practical and scannable.
- Prefer 3-6 services, 3-6 benefits, 3-5 FAQs, and 3-5 testimonials.
- Prefer stronger copy on hero, FAQ, testimonials, CTA, and section headings before expanding body text.
- For `E-commerce`, prioritize products, trust, buying benefits, and purchase FAQs.
- For `Landing Page`, prioritize conversion, proof, objections, and CTA.
- For `Website`, prioritize trust, services, process, proof, and contact.
- For hospitality niches such as hotels, hostels, or lodging, write copy that supports direct booking by WhatsApp and room selection.
- For hospitality briefs, keep services and CTA copy compatible with a reservation widget that includes `Chat`, `Reserva`, room plans, stay duration, price, and guest count.
- If a reference site is active, borrow only layout logic, interaction ideas, section rhythm, and widget patterns without copying branding or wording.

## Brief Shape

Write `content/brief.yaml` with this structure:

```yaml
businessName: string
projectType: Landing Page | Website | E-commerce
industry: string
businessDescription: string
mainOffer: string
primaryGoal: string
targetAudience: string
location: string
contact:
  whatsapp: string
  email: string
brand:
  themeMode: Light | Dark
  visualStyle: string
  layoutMode: string
  shellMode: string
  textAlign: left | center
  buttonShape: rounded | square
  primaryColor: "#RRGGBB"
  secondaryColor: "#RRGGBB"
  copyStyle: string
  visualConcept: string
  layoutMood: string
  visualSignature: string
  starterKit: string
hero:
  tag: string
  headline: string
  subtitle: string
services:
  - title: string
    description: string
benefits:
  - string
faq:
  - question: string
    answer: string
testimonials:
  - name: string
    role: string
    quote: string
cta:
  primaryLabel: string
  secondaryLabel: string
  contactTitle: string
  contactDescription: string
products:
  - name: string
    price: string
    description: string
keywords:
  - string
pages:
  - string
strategy:
  starterKit: string
  starterKitLabel: string
  brandThesis: string
  positioning: string
  proofAngle: string
  ctaStrategy: string
  artDirection: string
  recommendedSkillSequence:
    - string
designSystem:
  starterKit: string
  typographySystem: string
  densityProfile: string
  motionProfile: string
  surfaceProfile: string
scorecardTargets:
  visual: number
  conversion: number
  trust: number
  responsive: number
  content: number
```

## Final Check

Before finishing:

- confirm the brief is structurally complete
- confirm the copy matches the business text
- confirm the page type matches the expected component engine
- confirm the output reuses the existing architecture instead of replacing it
