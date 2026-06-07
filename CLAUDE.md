# Portfolio — CLAUDE.md

## Project

Personal developer/designer portfolio. Goal: memorable, distinctive, production-quality. Not a template. Not AI slop.

---

## Stack

- **Framework:** Next.js (App Router, Server Components by default)
- **Styling:** Tailwind v4 — use `@tailwindcss/postcss`, NOT the legacy `tailwindcss` postcss plugin
- **Animation:** `motion/react` (import from `"motion/react"`, not `"framer-motion"`)
- **Scroll effects:** GSAP + ScrollTrigger for pin/scrub work; Motion `whileInView` for simple reveals
- **Icons:** `@phosphor-icons/react` (primary) or `@tabler/icons-react` — never hand-roll SVG paths, never lucide-react unless already in package.json
- **Fonts:** `next/font` only — never `<link>` to Google Fonts

---

## Design Dials

Portfolio (developer/creative lean):

```
DESIGN_VARIANCE:  7   (offset layouts, asymmetry)
MOTION_INTENSITY: 6   (fluid reveals, hover physics, no cinematic overkill)
VISUAL_DENSITY:   3   (breathing room, editorial pacing)
```

Override these conversationally if the section calls for it.

---

## Typography

- **No Inter as default.** Choose from: `Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi`, `PP Neue Montreal`, or another characterful sans.
- **No Fraunces. No Instrument_Serif.** If a serif is genuinely justified (editorial/luxury context), pick from: PP Editorial New, Cormorant Garamond, Canela, Tiempos Headline — and never reuse the same one twice.
- Serif is very discouraged as default. "Creative brief" is NOT a reason to reach for serif.
- Display headlines: `text-4xl md:text-6xl tracking-tighter leading-none`
- Body: `text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-[65ch]`
- Italic descenders (`y g j p q`): use `leading-[1.1]` min + `pb-1` on the wrapper. Never clip descenders with `leading-none`.

---

## Color

- Max 1 accent color. Saturation < 80%.
- **No AI-purple gradients.** No neon glows. Use neutral bases (Zinc/Slate/Stone) + one high-contrast accent (Emerald, Electric Blue, Deep Rose, Burnt Orange, etc.).
- **No pure `#000000` or `#ffffff`** — use off-black (zinc-950) and off-white.
- One palette, whole page. No warm-gray sections beside cool-gray sections.
- One accent, every section. A rose-accented page does not get a teal CTA in the footer.

---

## Layout

- **Anti-center bias:** avoid centered hero when DESIGN_VARIANCE > 4. Use Split Screen, Left-aligned content/right asset, or Asymmetric whitespace instead.
- **No 3-column equal feature cards.** Use 2-col zig-zag, asymmetric bento, or horizontal-scroll instead.
- **No zigzag alternation for 3+ consecutive sections** (left-image/right-text repeating). Break with a full-width or vertical-stack section.
- **No split-header** (left big headline + right floating explainer paragraph) unless the right column holds a real visual, not filler text.
- Hero: headline ≤ 2 lines, subtext ≤ 20 words, CTA visible without scroll, max `pt-24` top padding.
- Hero stack: max 4 text elements — eyebrow OR brand strip, headline, subtext, CTAs. No tagline below CTAs.
- Nav: single line at desktop, height ≤ 80px.
- Layout containers: `max-w-7xl mx-auto` or `max-w-[1400px] mx-auto`.
- Full-height sections: `min-h-[100dvh]` — never `h-screen`.
- Grid over flex math: never `w-[calc(33%-1rem)]`. Use `grid grid-cols-3`.
- Mobile collapse is explicit per component. No "Tailwind handles it" assumptions.

---

## Motion

- **Every animation needs a one-sentence justification** (hierarchy, storytelling, feedback, or state transition). No animation for decoration.
- `useMotionValue` / `useTransform` for pointer/scroll-continuous values — never `useState` for these.
- **`window.addEventListener('scroll')` is banned.** Use `useScroll()` (Motion) or GSAP ScrollTrigger.
- `requestAnimationFrame` loops that touch React state: banned. Use motion values.
- All motion components: isolated client-leaf with `'use client'` at top.
- Reduced motion: any `MOTION_INTENSITY > 3` effect wraps `useReducedMotion()` and degrades to static.
- GSAP sticky-stack: `start: "top top"`, `pin: true`. See canonical skeleton in taste-skill.md §5.A.
- GSAP horizontal-pan: `start: "top top"`, `pin: true`, `end: "+=${distance}"`. See §5.B.
- Motion `whileInView` for simple scroll reveals (no GSAP needed): see §5.C.
- Max 1 horizontal marquee per page.
- Animate only `transform` and `opacity` — never `top`, `left`, `width`, `height`.

---

## Visual Quality

- **Real images.** Text + gradient blob is not a hero. Even a minimalist page needs 2-3 real images.
- Image sources: gen tool first → `https://picsum.photos/seed/{descriptive-seed}/{w}/{h}` → explicit placeholder slot with a TODO comment.
- **No div-based fake screenshots.** No styled-div dashboards or task lists pretending to be product UI.
- **No hand-rolled decorative SVGs** unless brief explicitly calls for it and it's a simple geometric mark.
- Backgrounds: atmospheric depth — gradient meshes, noise textures, layered transparencies, grain overlays. Never default to a solid flat color.
- Cards only where elevation communicates real hierarchy. Otherwise use `border-t`, `divide-y`, or negative space.
- One corner-radius system per page (all-sharp, all-soft 12-16px, or all-pill). No mixed systems.
- Shadow tint matches background hue. No pure-black drop shadows on light backgrounds.

---

## Content & Copy

- **Em-dash (`—`) is completely banned.** Headlines, body, quotes, attribution, captions, buttons — zero. Use a hyphen `-`, comma, period, or restructure the sentence.
- **En-dash as separator (`–`) is also banned.** Ranges use a hyphen: `2020-2024`.
- No filler verbs: "Elevate", "Seamless", "Unleash", "Next-Gen", "Revolutionize". Use concrete verbs.
- No eyebrow above every section. Max 1 eyebrow per 3 sections (hero counts as 1).
- No section-numbering eyebrows (`00 / INDEX`, `001 · Capabilities`).
- No scroll cues (`↓ scroll`, `Scroll to explore`).
- No decoration text strip at hero bottom (`BRAND. MOTION. SPATIAL.`).
- No version labels in hero (V0.6, BETA, INVITE-ONLY).
- No locale/time/weather strips in nav or footer unless the brief is explicitly place-focused.
- Middle-dot `·` max 1 per line in metadata strips.
- One CTA per intent on the page ("Get in touch" and "Let's talk" cannot coexist — pick one).
- CTA label: fits on one line at desktop, 1-3 words preferred.
- Copy self-audit before shipping: re-read every visible string. Rewrite anything that sounds like AI trying to sound thoughtful.

---

## Page Theme

- One theme (light, dark, or system `prefers-color-scheme`) set at the layout root. Sections do not invert.
- Tints within the same family are fine (`bg-zinc-950` next to `bg-zinc-900`). Flipping to `bg-amber-50` mid-dark-page is broken.

---

## Accessibility

- WCAG AA minimum for body text (4.5:1), AAA target for hero copy.
- Button contrast: every CTA text readable against its background.
- Form inputs, placeholders, focus rings all pass WCAG AA against the section background.
- No placeholder-as-label. Label above input, error below.
- `prefers-reduced-motion` honored for all motion above intensity 3.

---

## Forbidden Patterns (hard bans)

- Inter as default font
- Purple/neon gradients as default aesthetic
- Three equal feature cards in a row
- Centered hero (unless editorial/manifesto brief)
- `h-screen` for full-height sections (use `min-h-[100dvh]`)
- `window.addEventListener('scroll')` (use Motion `useScroll` or GSAP ScrollTrigger)
- `useState` for continuous pointer/scroll values
- Hand-rolled SVG icon paths
- Div-based fake product UI screenshots
- Empty bento cells
- `border-t` + `border-b` on every row of a long list
- Em-dash anywhere
- Eyebrow on every section
- Two marquees on one page
- Pills/labels overlaid on images
- Photo-credit captions as decoration
- Version footers (`v1.4.2`) on marketing pages
- Decorative status dots

---

## Pre-Ship Checklist

Before declaring any page done, verify:

- [ ] Zero em-dashes on the page
- [ ] One accent color used identically across all sections
- [ ] One corner-radius system applied consistently
- [ ] Every CTA: text readable against background (WCAG AA)
- [ ] No CTA label wraps at desktop
- [ ] Hero: ≤ 2-line headline, ≤ 20-word subtext, CTA visible without scroll
- [ ] Eyebrow count ≤ ceil(sectionCount / 3)
- [ ] No 3+ consecutive image+text-split sections
- [ ] Real images used (no div fake-screenshots)
- [ ] Motion justified per animation (one-sentence test)
- [ ] `prefers-reduced-motion` respected
- [ ] Dark mode tested
- [ ] Mobile collapse explicit for every multi-column layout
- [ ] Nav renders on single line at desktop
- [ ] Copy self-audited (no AI-hallucinated phrases, no filler verbs)
