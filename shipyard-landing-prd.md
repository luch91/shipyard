# Shipyard Landing Page — Product Requirements Document

**Product:** Shipyard — Browser-based GenLayer Intelligent Contract Deployment  
**URL:** https://genshipyard.com  
**Scope:** Landing page upgrade — `app/page.tsx` only  
**Version:** 1.0  
**Status:** Ready for Build  
**Date:** June 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Design System Spec](#2-design-system-spec)
3. [Animation Spec](#3-animation-spec)
4. [Component Inventory](#4-component-inventory)
5. [Section Breakdown](#5-section-breakdown)
6. [Responsive Behavior](#6-responsive-behavior)
7. [Performance Constraints](#7-performance-constraints)
8. [Safety Rules](#8-safety-rules)
9. [File Delivery Plan](#9-file-delivery-plan)
10. [Implementation Order](#10-implementation-order)

---

## 1. Executive Summary

### 1.1 What Shipyard Is

Shipyard is the browser-based deployment platform for GenLayer Intelligent Contracts — "the Thirdweb for GenLayer." It eliminates every friction point between a developer and a deployed Intelligent Contract: no CLI, no terminal, no local environment. A developer uploads a Python contract, fills in constructor params through a typed form, picks a network, and deploys in under 60 seconds.

The platform serves two personas simultaneously:

**Newbies** — no prior GenLayer experience. They discover Shipyard, pick one of 20 templates, and deploy a real Intelligent Contract before they understand how it works. The experience converts curiosity into deployed contracts.

**Experts** — already building on GenLayer. They need fast turnaround: paste a contract, deploy, iterate. Shipyard gives them introspection (constructor param parsing), live logs, network comparison, and contract interaction — all without leaving the browser.

### 1.2 What the Current Landing Page Is

The current `app/page.tsx` is functional but flat. It has:
- A centered hero with headline and two CTAs
- Three step cards explaining the flow (Upload → Configure → Deploy)
- A network status grid showing 4 networks

It is competent. It is not memorable. It does not communicate the full power of the platform — the AI generation, the Living Contracts, the live terminal, the 20 templates. A builder landing on it for the first time learns the basics but gets no sense of what makes Shipyard exceptional.

### 1.3 What the Upgrade Achieves

The upgraded landing page does three things the current one does not:

**Shows more of the product.** Seven sections surface capabilities that the current page ignores: AI generation, Living Contracts, network comparison, the live terminal, the contract registry. Builders understand what they're deploying into.

**Communicates precision and craft.** The chromatic glass aesthetic — dark, emerald-lit, with moving depth — signals that this is a serious developer tool built with intention. It matches the quality of the actual product. Linear.app built developer trust partly through how its interface felt. Shipyard's landing page should do the same.

**Converts at the bottom of the page.** The current page has one conversion point (the hero CTAs). The upgrade adds a final CTA banner so builders who scroll through all seven sections encounter a second, reinforced push to deploy.

### 1.4 Success Metrics

| Metric | Current (baseline) | Target |
|---|---|---|
| Bounce rate | — | < 50% |
| Time on page | — | > 90 seconds |
| Hero CTA click-through | — | > 15% |
| Scroll depth (to section 5+) | — | > 40% |
| Deploy page entries from landing | — | +30% vs current |

---

## 2. Design System Spec

### 2.1 Brand Color Tokens

These tokens are already defined by the existing app. They are reproduced here as the single source of truth for the landing page. Nothing is added. Nothing is changed.

```css
/* ── BASE SURFACES ─────────────────────────────────────────────────────────── */
--color-base:     #0a0a0a;   /* neutral-950 — page background                  */
--color-surface:  #171717;   /* neutral-900 — card backgrounds, terminal        */
--color-elevated: #262626;   /* neutral-800 — borders, hover states             */

/* ── PRIMARY BRAND ─────────────────────────────────────────────────────────── */
--color-emerald:  #34d399;   /* emerald-400 — THE accent. Never replace.        */
--color-emerald-dim: rgba(52, 211, 153, 0.08);  /* surface tint                */
--color-emerald-glow: rgba(52, 211, 153, 0.6);  /* drop-shadow glow            */

/* ── NETWORK COLORS (existing, DO NOT change) ───────────────────────────────  */
--color-bradbury:  #34d399;  /* emerald-400 */
--color-asimov:    #fbbf24;  /* amber-400   */
--color-studionet: #a78bfa;  /* violet-400  */
--color-localnet:  #a3a3a3;  /* neutral-400 */

/* ── TEXT ──────────────────────────────────────────────────────────────────── */
--color-text-primary:   #ffffff;
--color-text-secondary: #a3a3a3;  /* neutral-400 */
--color-text-muted:     #525252;  /* neutral-600 */
--color-text-emerald:   #34d399;

/* ── GLASS SYSTEM ──────────────────────────────────────────────────────────── */
--glass-bg:       rgba(255, 255, 255, 0.04);
--glass-bg-tint:  rgba(52, 211, 153, 0.04);
--glass-border:   rgba(255, 255, 255, 0.08);
--glass-inset:    rgba(255, 255, 255, 0.06);
```

### 2.2 Typography

No new fonts. Fira Code and Syne are already imported in `globals.css`.

| Role | Font | Weight | Size | Usage |
|---|---|---|---|---|
| Hero headline | Syne | 800 | `clamp(32px, 5vw, 56px)` | Section 1 H1 |
| Section title | Syne | 700 | `clamp(24px, 3vw, 36px)` | H2 per section |
| Card title | Syne | 600 | `18px` | Feature card headings |
| Body | Syne | 400 | `14–15px` | Descriptions, paragraphs |
| Code / mono | Fira Code | 400/500 | `12–13px` | Terminal, labels, badges |
| Pre-labels | Fira Code | 500 | `10px` | Section pre-headers, tracked `0.2em` |

**Tailwind utility mapping:**

```
Hero headline:   font-[Syne] text-[clamp(32px,5vw,56px)] font-extrabold
Section title:   font-[Syne] text-[clamp(24px,3vw,36px)] font-bold
Card title:      text-lg font-semibold
Body:            text-sm text-neutral-400 leading-relaxed
Pre-label:       font-mono text-[10px] tracking-[0.2em] uppercase text-emerald-400
Terminal text:   font-mono text-xs text-neutral-400
```

### 2.3 Spacing System

8px base grid. All spacing values are multiples of 8.

```
space-2  =  8px   (gap-2, p-2)
space-4  = 16px   (gap-4, p-4)
space-6  = 24px   (gap-6, p-6)
space-8  = 32px   (gap-8, p-8)
space-12 = 48px   (gap-12, py-12)
space-16 = 64px   (py-16 — mobile section padding)
space-24 = 96px   (py-24 — desktop section padding)

Max content width: max-w-5xl (1100px) — matches existing app convention
```

### 2.4 Border Radius

```
rounded-md   =  6px   — badges, step number chips
rounded-lg   =  8px   — small cards, pills
rounded-xl   = 12px   — glass cards (matches glass-card spec)
rounded-2xl  = 16px   — terminal mockup, CTA button
rounded-full = 999px  — pill buttons, stat pills
```

### 2.5 Chromatic Glass System

The glass system is Shipyard-specific — emerald as the light source, not indigo or purple. Every glass surface in the landing page uses these exact values.

```css
/* ── GLASS CARD BASE ───────────────────────────────────────────────────────── */
.glass-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.04),
    rgba(52, 211, 153, 0.04)   /* emerald light tint */
  );
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.4),
    0 1px 0 rgba(255, 255, 255, 0.06) inset;
  position: relative;
}

/* ── CHROMATIC EDGE — emerald bleeds top-left ──────────────────────────────── */
.glass-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 13px;
  background: linear-gradient(
    135deg,
    rgba(52, 211, 153, 0.2),   /* emerald source — top-left */
    transparent 40%,
    rgba(52, 211, 153, 0.05)   /* faint recovery — bottom-right */
  );
  z-index: -1;
  pointer-events: none;
}

/* ── GLASS CARD HOVER ──────────────────────────────────────────────────────── */
.glass-card:hover {
  border-color: rgba(52, 211, 153, 0.2);
  box-shadow:
    0 4px 32px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(52, 211, 153, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.08) inset;
  transform: translateY(-2px) scale(1.02);
  transition: all 200ms ease;
}
```

**Tailwind equivalent (for inline use in JSX):**

```tsx
// Glass card wrapper — use this className string on every card
const glassCard = `
  relative rounded-xl border border-white/[0.08]
  bg-gradient-to-br from-white/[0.04] to-emerald-400/[0.04]
  backdrop-blur-xl
  shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]
  transition-all duration-200
  hover:border-emerald-500/20
  hover:shadow-[0_4px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(52,211,153,0.1)]
  hover:-translate-y-0.5 hover:scale-[1.02]
`
```

### 2.6 Ambient Glow

Used in the hero section — a radial emerald bloom from the top center.

```css
.emerald-glow {
  background: radial-gradient(
    ellipse 800px 600px at 50% 0%,
    rgba(52, 211, 153, 0.08) 0%,
    transparent 70%
  );
}
```

### 2.7 Keyframe Animations (added to globals.css)

These are appended to `app/globals.css` and never replace existing styles.

```css
/* ── AURORA DRIFT ──────────────────────────────────────────────────────────── */
@keyframes aurora {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.aurora-bg {
  background: linear-gradient(
    -45deg,
    rgba(52, 211, 153, 0.12),
    rgba(251, 191, 36, 0.06),
    rgba(167, 139, 250, 0.06),
    rgba(52, 211, 153, 0.08)
  );
  background-size: 400% 400%;
  animation: aurora 14s ease infinite;
}

/* ── LOGO PULSE ────────────────────────────────────────────────────────────── */
@keyframes logo-pulse {
  0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 6px rgba(52, 211, 153, 0.4)); }
  50%       { opacity: 1.0; filter: drop-shadow(0 0 12px rgba(52, 211, 153, 0.7)); }
}

.logo-pulse {
  animation: logo-pulse 3s ease-in-out infinite;
}

/* ── CHROMATIC BORDER PULSE ────────────────────────────────────────────────── */
@keyframes chromatic-pulse {
  0%   { box-shadow: 0 0 0 1px rgba(52, 211, 153, 0.3); }
  50%  { box-shadow: 0 0 0 1.5px rgba(52, 211, 153, 0.6); }
  100% { box-shadow: 0 0 0 1px rgba(52, 211, 153, 0.3); }
}

.pulse-border { animation: chromatic-pulse 3s ease infinite; }

/* ── CTA SHIMMER SCAN ──────────────────────────────────────────────────────── */
@keyframes shimmer-scan {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.shimmer-btn {
  background: linear-gradient(
    90deg,
    #34d399 0%,
    #34d399 40%,
    #6ee7b7 50%,
    #34d399 60%,
    #34d399 100%
  );
  background-size: 200% auto;
  animation: shimmer-scan 2s linear infinite;
}

/* ── TERMINAL LOADING DOTS ─────────────────────────────────────────────────── */
@keyframes dot-flash {
  0%, 100% { opacity: 0.2; }
  50%       { opacity: 1.0; }
}

.dot-1 { animation: dot-flash 1.2s ease infinite 0.0s; }
.dot-2 { animation: dot-flash 1.2s ease infinite 0.2s; }
.dot-3 { animation: dot-flash 1.2s ease infinite 0.4s; }
.dot-4 { animation: dot-flash 1.2s ease infinite 0.6s; }

/* ── SCROLL CHEVRON BOUNCE ─────────────────────────────────────────────────── */
@keyframes chevron-bounce {
  0%, 100% { transform: translateY(0);   opacity: 0.4; }
  50%       { transform: translateY(6px); opacity: 0.8; }
}

.chevron-bounce { animation: chevron-bounce 1.6s ease-in-out infinite; }

/* ── REDUCED MOTION OVERRIDES ──────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .aurora-bg,
  .logo-pulse,
  .pulse-border,
  .shimmer-btn,
  .dot-1, .dot-2, .dot-3, .dot-4,
  .chevron-bounce {
    animation: none !important;
  }
}
```

---

## 3. Animation Spec

All Framer Motion animations use the `useReducedMotion()` hook before running. CSS animations are disabled via the `@media (prefers-reduced-motion: reduce)` block in globals.css.

| ID | Name | Trigger | Target Component | Duration | Easing | Library | Notes |
|---|---|---|---|---|---|---|---|
| A1 | Aurora Drift | Continuous | Hero + CTA backgrounds | 14s loop | ease | CSS | Pure CSS, no JS cost |
| A2 | Fade Up | Scroll into view | Section headings, all cards | 500ms, 80ms stagger | easeOut | Framer Motion | `whileInView`, `once: true`, `margin: "-80px"` |
| A3 | Logo Pulse | Continuous | Hero logo glow | 3s loop | ease-in-out | CSS | `logo-pulse` keyframe |
| A4 | Terminal Typewriter | On mount | Hero terminal mockup | 40ms/char | linear | Framer Motion | Loop: complete → 2s hold → fade → restart |
| A5 | Network Dot Pulse | Continuous | Live network status dots | 2s | ease | Tailwind | `animate-pulse` on dot only if `network.isLive` |
| A6 | Card Hover | Hover | All glass cards | 200ms | ease | CSS | `translateY(-2px) scale(1.02)`, emerald border intensifies |
| A7 | Stats Counter | Scroll into view | Stats bar numbers | 1.2s | easeOut | Framer Motion | Count from 0 to target on viewport entry |
| A8 | CTA Shimmer | Continuous | Final CTA button | 2s loop | linear | CSS | `shimmer-scan` keyframe — scan left to right |
| A9 | Floating Code | Continuous | Hero background | 8–16s/fragment | linear | Framer Motion | 6 fragments, opacity 0.04–0.08, upward drift, random x |

### 3.1 A2 — Fade Up Implementation

```tsx
// Reusable wrapper — used on every section heading and card
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
}

// Usage
<motion.div
  variants={staggerContainer}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-80px" }}
>
  <motion.h2 variants={fadeUp}>Section Title</motion.h2>
  <motion.div variants={fadeUp}>Card 1</motion.div>
  <motion.div variants={fadeUp}>Card 2</motion.div>
</motion.div>
```

### 3.2 A4 — Terminal Typewriter Implementation

```tsx
// Implemented in components/landing/TerminalTypewriter.tsx
// "use client"

const LINES = [
  { text: "$ shipyard deploy ./my_contract.py --network bradbury", color: "text-neutral-300" },
  { text: "  ✓ Contract parsed — 2 constructor params found",        color: "text-emerald-400" },
  { text: "  ✓ Wallet connected — 0x4a2f...3b1e",                   color: "text-emerald-400" },
  { text: "  ✓ Deploying to Testnet Bradbury...",                    color: "text-emerald-400" },
  { text: "  ↳ Contract address: 0x7c3d...9f2a ✓",                  color: "text-emerald-400" },
]
// Character delay: 40ms
// Hold on completion: 2000ms
// Fade out: 300ms
// Restart: infinite loop
```

### 3.3 A7 — Stats Counter Implementation

```tsx
// Implemented in components/landing/StatCounter.tsx
// "use client"

// Uses useMotionValue + useTransform from Framer Motion
// Counts from 0 to target over 1.2s on whileInView
// Targets: 20 (Templates), 4 (Networks), 0 (CLI Required)
// "0 CLI Required" — counter stays at 0, label is the value
```

### 3.4 A9 — Floating Code Fragments Implementation

```tsx
// Implemented in components/landing/FloatingCode.tsx
// "use client"

const FRAGMENTS = [
  "@gl.public.view\ndef get_value(self) -> str:\n    return self.state_var",
  "class MyContract(gl.Contract):\n    state_var: str",
  "@gl.public.write\ndef set_value(self, v: str):\n    self.state_var = v",
  "# { \"Depends\": \"py-genlayer:1jb4...\" }",
  "from genlayer import *",
  "self.state_var = initial_value",
]
// 6 fragments, each with random:
//   - x position (5% to 85% of container width)
//   - y starting position (below container)
//   - duration (8s to 16s)
//   - delay (0s to 8s)
// opacity: 0.04–0.08, Fira Code 11px, neutral-500
// Loop: y from 100% to -20%, then restart
```

---

## 4. Component Inventory

All new components live in `components/landing/`. They are client components (`"use client"`) imported into `app/page.tsx` which stays a Server Component.

### 4.1 New Files Created

| File | Type | Purpose |
|---|---|---|
| `components/landing/HeroSection.tsx` | Client | Full hero: aurora, logo, headline, CTAs, terminal, chevron |
| `components/landing/TerminalTypewriter.tsx` | Client | Animated typewriter terminal in hero |
| `components/landing/FloatingCode.tsx` | Client | Background floating Python fragments |
| `components/landing/StatsBar.tsx` | Client | Three animated stat counters |
| `components/landing/HowItWorksSection.tsx` | Client | Three step cards with SVG connector |
| `components/landing/FeaturesSection.tsx` | Client | Bento grid of 6 feature cards |
| `components/landing/TerminalSpotlight.tsx` | Client | Two-column section with static terminal |
| `components/landing/CTABanner.tsx` | Client | Final CTA with aurora and shimmer button |

### 4.2 Existing Files Modified

| File | Change |
|---|---|
| `app/page.tsx` | Full rewrite — imports all `components/landing/` components |
| `app/globals.css` | Append new `@keyframes` at bottom only |

### 4.3 Existing Files Preserved (DO NOT TOUCH)

| File | Reason |
|---|---|
| `app/layout.tsx` | Controls Header, Sidebar, global providers |
| `components/layout/Header.tsx` | Live nav — must not change |
| `components/layout/Sidebar.tsx` | Deployment history — must not change |
| `lib/genlayer/networks.ts` | Live network data — `getAllNetworks()` still used in page |
| All `app/**/page.tsx` except `app/page.tsx` | Other app pages untouched |
| All `components/deploy/`, `interact/`, `registry/` | App functionality untouched |
| All `hooks/`, `lib/`, `types/` | Core logic untouched |

### 4.4 Shared Primitives (used across landing components)

```tsx
// Glass card wrapper (inline Tailwind — no new component needed)
const glassCard = `
  relative rounded-xl border border-white/[0.08]
  bg-gradient-to-br from-white/[0.04] to-emerald-400/[0.04]
  backdrop-blur-xl
  shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]
  hover:border-emerald-500/20
  hover:-translate-y-0.5 hover:scale-[1.02]
  transition-all duration-200
`

// Pre-label (section identifier)
// <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-emerald-400">
//   LIVE DEPLOY LOGS
// </span>

// Emerald filled pill button
// <Link className="rounded-full bg-emerald-500 px-6 py-3 font-mono font-semibold
//                  text-neutral-950 hover:bg-emerald-400 transition-colors">

// Glass ghost pill button
// <Link className="rounded-full border border-white/10 px-6 py-3 font-mono font-semibold
//                  text-neutral-300 hover:border-white/20 hover:text-white
//                  backdrop-blur-sm transition-colors">
```

---

## 5. Section Breakdown

### 5.1 Section 1 — Hero

**Purpose:** Immediate brand impression. Establish Shipyard's identity as a precision developer tool. Drive clicks to `/deploy` and `/templates`.

**Height:** `calc(100vh - 56px)` — full viewport minus the sticky header.

**Layer stack (bottom → top):**

| Layer | Implementation | z-index |
|---|---|---|
| Aurora drift | `<div className="aurora-bg absolute inset-0" />` | 0 |
| Floating code | `<FloatingCode />` — 6 fragments drifting upward | 1 |
| Emerald ambient glow | `radial-gradient` div, absolute, top-0, center | 2 |
| Content | flex column, centered, relative | 10 |

**Content (top → bottom):**

```
1. Pre-badge (existing — keep exactly)
   ● Bradbury Testnet Live
   [emerald pulse dot] [Fira Code 11px emerald-400]
   Border: border-emerald-500/20, bg: emerald-500/5, pill

2. Hero Logo
   <ShipyardHeroLogo /> — 48px icon.svg inside glass container
   Glow halo (bg-emerald-400/20 blur-xl absolute)
   logo-pulse CSS animation (A3)

3. Headline
   "Deploy Intelligent Contracts"
   "in 60 seconds."
   Syne 800, clamp(32px, 5vw, 56px), white
   Line 2: text-emerald-400 (matching existing)

4. Subheadline
   "The no-CLI deployment platform for GenLayer Intelligent Contracts.
    Upload Python, configure params, deploy — straight from the browser."
   Syne 400, 16px, neutral-400, max-w-lg, text-center

5. CTA Pair
   [Start Deploying →]  (emerald filled pill)  href="/deploy"
   [Browse Templates]   (glass ghost pill)      href="/templates"
   gap-3, flex-wrap, justify-center

6. Terminal Mockup
   <TerminalTypewriter />
   Glass card, max-w-[460px], w-full, mx-auto
   Fira Code, dark bg (neutral-950/80), rounded-xl
   Top bar: three colored dots (red/amber/green, decorative) + "shipyard"
   Body: typewriter animation (A4)

7. Scroll Chevron
   ChevronDown from lucide-react, 20px, neutral-600
   chevron-bounce CSS animation
   Links to #how-it-works
```

**Entrance animations:** Hero content fades up in sequence with Framer Motion on mount (not scroll — it's above the fold). Delays: badge 0ms, logo 100ms, headline 200ms, sub 300ms, CTAs 400ms, terminal 600ms.

---

### 5.2 Section 2 — Stats Bar

**Purpose:** Rapid credibility signal. Three concrete facts about Shipyard that a developer can absorb in 2 seconds.

**Layout:** Horizontal flex row, centered, gap-6. On mobile: same (the numbers are short enough).

**Three stats:**

| Number | Label | Note |
|---|---|---|
| 20 | Templates | Counts up from 0 via A7 |
| 4 | Networks | Counts up from 0 via A7 |
| 0 | CLI Required | Counter stays at 0 — the 0 is the point |

**Each stat (glass pill):**

```tsx
<div className="flex flex-col items-center gap-1 rounded-full
                border border-white/[0.06] bg-white/[0.03]
                px-8 py-4 backdrop-blur-sm">
  <StatCounter target={20} />  {/* Syne 800, text-4xl, text-emerald-400 */}
  <span className="font-mono text-xs text-neutral-500 tracking-widest uppercase">
    Templates
  </span>
</div>
```

**Scroll reveal:** Stagger 80ms per pill (A2).

---

### 5.3 Section 3 — How It Works

**Purpose:** Explain the deploy flow to first-time visitors. Match the existing step structure but elevate it visually with glass cards, better typography, and a connecting SVG line.

**Section header:**
```
[Pre-label: Fira Code, "THE FLOW", emerald, tracked]
[Title: Syne 700, "Deploy in three steps."]
```

**Layout (desktop):** `grid grid-cols-3 gap-6 relative`

**Connector (desktop only):**
SVG dashed line positioned absolutely between the three cards.
Framer Motion `pathLength` animation on scroll into view.

```tsx
// Desktop connector SVG
<svg className="absolute top-12 left-0 right-0 hidden md:block pointer-events-none"
     height="2" style={{ width: '100%' }}>
  <motion.line
    x1="17%" y1="1" x2="83%" y2="1"
    stroke="#34d399" strokeWidth="1" strokeDasharray="6 4"
    initial={{ pathLength: 0, opacity: 0 }}
    whileInView={{ pathLength: 1, opacity: 0.4 }}
    viewport={{ once: true }}
    transition={{ duration: 1.2, ease: "easeInOut" }}
  />
</svg>
```

**Each step card (glass-card, p-6):**

```
[Step badge: "01" Fira Code, emerald-400/10 bg, emerald text, rounded-md]
[Icon: lucide-react, neutral-400, mt-2]
[Title: Syne 600, white, mt-3]
[Description: Syne 400, neutral-400, 14px, leading-relaxed]
```

| Step | Badge | Icon | Title | Description |
|---|---|---|---|---|
| 1 | 01 | `Upload` | Upload your contract | Paste or drop a Python Intelligent Contract file. Shipyard parses constructor params automatically. |
| 2 | 02 | `Settings` | Configure parameters | Fill in constructor arguments with a typed form — no JSON wrangling or CLI flags. |
| 3 | 03 | `Rocket` | Deploy to any network | Choose Bradbury, Asimov, Studionet, or Localnet. One click deploys and streams live logs. |

**Scroll reveal:** Stagger 80ms per card (A2). Cards reveal left-to-right.

---

### 5.4 Section 4 — Feature Showcase

**Purpose:** Communicate that Shipyard is more than a deploy button. Surface AI generation, Living Contracts, and other differentiating features. Change a visitor's mental model from "deployment tool" to "full Intelligent Contract platform."

**Section header:**
```
[Pre-label: "WHAT'S INSIDE"]
[Title: "Everything you need. Nothing you don't."]
[Sub: "20 templates, AI generation, living contracts, and full interaction tooling —
       all in the browser."]
```

**Bento grid layout:**

```
Desktop (lg):
┌─────────────────────────────┬──────────────────┬──────────────────┐
│  AI Contract Generation     │  20 Templates    │  Net. Comparison  │
│  [LARGE — spans 2 rows]     ├──────────────────┼──────────────────┤
│                             │  Registry        │  Interact Page    │
├─────────────────────────────┴──────────────────┴──────────────────┤
│  Living Contracts [LARGE — full width bottom row]                  │
└────────────────────────────────────────────────────────────────────┘

CSS Grid:
grid-template-columns: repeat(3, 1fr)
grid-template-rows: auto auto

Feature 1 (AI): grid-row: span 2
Feature 2 (Living): grid-column: span 3 (full width, shorter height)
Features 3–6: one cell each
```

**Large card additional content:**

Feature 1 — AI Contract Generation:
- Mini visual: fake prompt input → Python output display
- `<Sparkles size={20} className="text-emerald-400" />`

Feature 2 — Living Contracts:
- Horizontal layout on full-width card: text left, mini feature list right
- Examples: "Digital Pet", "Adaptive Persona", "Living Constitution"

**Feature card data:**

| # | Title | Icon | Description | Visual | Size |
|---|---|---|---|---|---|
| 1 | AI Contract Generation | Sparkles | Describe your contract in plain English. Get a deployable Python Intelligent Contract in seconds. | Prompt → code mockup | Large (col 1, rows 1–2) |
| 3 | 20 Ready Templates | LayoutTemplate | From Hello World to prediction markets. Every template arrives pre-filled and ready to deploy. | — | Small |
| 4 | Network Comparison | GitCompare | Deploy the same contract to two networks simultaneously. See how Bradbury and Asimov differ. | — | Small |
| 5 | Contract Registry | Database | Browse every Intelligent Contract on live GenLayer networks. Fork any of them in one click. | — | Small |
| 6 | Interact Page | Terminal | Call read and write methods on any deployed contract directly from the browser. | — | Small |
| 2 | Living Contracts | Zap | Deploy contracts that evolve. Digital pets, self-amending constitutions, adapting personas — all on-chain. | Feature list | Large (full width) |

**Scroll reveal:** Stagger 80ms per card (A2). Card hover: glass intensifies, `scale(1.02)` (A6).

---

### 5.5 Section 5 — Network Status

**Purpose:** Show the 4 supported networks with live status indicators. This is lifted directly from the existing landing page — the `getAllNetworks()` call and `NETWORK_COLOR_CLASSES` import are preserved exactly. Only the visual treatment is elevated.

**Section header:**
```
[Pre-label: "NETWORKS"]
[Title: "Four networks. One platform."]
```

**Layout:** `grid grid-cols-2 gap-3 sm:grid-cols-4`

**Each network card (glass-card, px-4 py-4):**

```tsx
<div className={`glass-card px-4 py-4 transition-all duration-200
                 hover:border-${networkColor}-500/30`}>
  <div className="flex items-center gap-2 mb-2">
    <span className={`h-2 w-2 rounded-full ${colors.dot}
                      ${network.isLive ? 'animate-pulse' : 'opacity-40'}`} />
    <span className={`font-mono text-xs font-medium ${colors.text}`}>
      {network.name}
    </span>
  </div>
  <p className="text-xs text-neutral-500 leading-relaxed">
    {network.description}
  </p>
</div>
```

**Below grid (preserve existing links exactly):**

```tsx
<div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-600">
  <span>Need testnet tokens?</span>
  <a href="https://testnet-faucet.genlayer.foundation" target="_blank" ...>
    Bradbury / Asimov Faucet <ExternalLink size={11} />
  </a>
  <a href="https://docs.genlayer.com" target="_blank" ...>
    GenLayer Docs <ExternalLink size={11} />
  </a>
</div>
```

**Scroll reveal:** All 4 cards stagger 80ms (A2). Network dot pulses if `network.isLive` (A5).

---

### 5.6 Section 6 — Terminal Feature Spotlight

**Purpose:** Showcase the live deploy terminal — the feature that distinguishes Shipyard from every other GenLayer tool. This is the "show don't tell" section.

**Section header (centered above columns):**
```
[Pre-label: "LIVE DEPLOY LOGS"]
```

**Layout (desktop):** Two columns, gap-12. Left: text content. Right: static terminal mockup.

**Left column:**

```
[Title: Syne 800, "Watch your contract land in real time."]
[Body: "No black box. No waiting and wondering. Shipyard streams
        every step of the deployment — from transaction submission
        to contract address confirmation."]
[CTA: "Try a Deploy →" → /deploy  (emerald filled pill, self-start)]
```

**Right column — Terminal Mockup (static, not typewriter):**

```tsx
// Glass card, rounded-xl, overflow-hidden
// Left border: 2px solid emerald-400/60 (the "glow on left border")
// Top bar: dot row + "Shipyard Deploy Terminal" label

<div className="glass-card overflow-hidden"
     style={{ borderLeft: '2px solid rgba(52, 211, 153, 0.5)' }}>
  {/* Top bar */}
  <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
    <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
    <span className="ml-2 font-mono text-xs text-neutral-500">
      Shipyard Deploy Terminal
    </span>
  </div>

  {/* Terminal body */}
  <div className="p-4 font-mono text-xs space-y-1.5">
    <Line label="Uploading contract..."           value="✓" />
    <Line label="Parsing constructor params..."   value="✓  (2 found)" />
    <Line label="Connecting wallet..."            value="✓  0x4a2f...3b1e" />
    <Line label="Submitting transaction..."       value="✓  0xf3c8...7d91" />
    <div className="pt-1">
      <span className="text-neutral-500">Waiting for consensus...</span>
      <div className="ml-4 mt-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-neutral-600">↳ LLM validators processing</span>
          <div className="flex gap-0.5">
            <span className="dot-1 text-emerald-400">●</span>
            <span className="dot-2 text-emerald-400">●</span>
            <span className="dot-3 text-emerald-400">●</span>
            <span className="dot-4 text-emerald-400">●</span>
            <span className="text-neutral-700">○</span>
          </div>
        </div>
        <div className="text-emerald-400">↳ Consensus reached  ✓</div>
      </div>
    </div>
    <div className="pt-2 border-t border-white/[0.04]">
      <div className="text-emerald-400 font-semibold">Contract deployed!</div>
      <div className="mt-1 space-y-0.5 text-neutral-500">
        <div>  Address: <span className="text-emerald-400">0x7c3d...9f2a</span>  ✓</div>
        <div>  Network: <span className="text-neutral-300">Testnet Bradbury</span></div>
        <div>  Block:   <span className="text-neutral-300">#1,847,291</span></div>
      </div>
    </div>
  </div>
</div>
```

**Scroll reveal:** Left column fades up (A2). Right terminal slides in from the right (x: 40 → 0), same scroll trigger.

---

### 5.7 Section 7 — CTA Banner

**Purpose:** Final conversion moment. Builders who scrolled through all six sections have high intent. Give them a clear, reinforced push to start deploying.

**Layout:** Full-width within `max-w-5xl`. Aurora background behind everything.

**Layer stack:**
- Aurora drift background (A1), emerald-dominant
- 4 floating code fragments (A9), slower (12–20s), fewer
- Content (centered, relative z-10)

**Content:**

```
[Headline: Syne 800, clamp(28px, 4vw, 44px)]
"Start deploying in 60 seconds."

[Sub: Syne 400, neutral-400, max-w-md]
"No CLI. No setup. Just your Python contract and a browser."

[CTA: shimmer-btn class, rounded-full, px-8 py-4]
"Deploy Your First Contract →"
href="/deploy"
Text: neutral-950 (dark text on emerald)
```

**Border:** Full-width glass surface with `pulse-border` class (chromatic emerald pulse, A8).

**Scroll reveal:** Headline and sub fade up (A2). CTA button fades in 200ms later.

---

## 6. Responsive Behavior

### 6.1 Breakpoints

Matches existing Tailwind defaults (already configured in the project):

```
sm:  640px   — large mobile
md:  768px   — tablet
lg:  1024px  — desktop
xl:  1280px  — wide desktop
```

### 6.2 Per-Section Responsive Rules

| Section | Mobile (< 768px) | Tablet (768–1023px) | Desktop (1024px+) |
|---|---|---|---|
| **Hero** | Full height, content stacked, terminal max-w full | Same, terminal 380px | Terminal 460px, content centered |
| **Stats** | 3 pills in a row, compressed padding | Same | Same |
| **How It Works** | 1-col stacked, no SVG connector | 1-col stacked | 3-col grid, SVG connector |
| **Features** | 1-col stacked, all cards same size | 2-col grid | Bento: col 1 spans 2 rows, row 3 full width |
| **Networks** | 2×2 grid | 4-col | 4-col |
| **Terminal Spotlight** | 1-col, terminal below text | 1-col | 2-col, text left / terminal right |
| **CTA Banner** | Centered, full width | Same | Same |

### 6.3 Typography Scaling

All display text uses `clamp()` — never fixed px on mobile.

```css
.hero-headline {
  font-size: clamp(32px, 5vw, 56px);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.section-title {
  font-size: clamp(24px, 3vw, 36px);
  line-height: 1.2;
}
```

### 6.4 Animation Behavior on Mobile

| Animation | Mobile Behavior |
|---|---|
| Aurora (A1) | Continues — pure CSS, no performance impact |
| Fade Up (A2) | Continues — opacity/transform only |
| Logo Pulse (A3) | Continues |
| Typewriter (A4) | Continues — text only |
| Network Pulse (A5) | Continues |
| Card Hover (A6) | Disabled on touch — `hover:` doesn't fire on mobile |
| Stats Counter (A7) | Continues |
| Shimmer (A8) | Continues |
| Floating Code (A9) | Fragment count reduced to 3 on mobile |

---

## 7. Performance Constraints

### 7.1 Core Web Vitals Targets

| Metric | Target | How Achieved |
|---|---|---|
| LCP | < 2s | Hero text is LCP candidate — no large images above fold. Syne/Fira Code already preloaded in globals.css. |
| FID / INP | < 100ms | All animations use CSS transforms and opacity only. No layout-triggering properties. |
| CLS | < 0.1 | Terminal mockup has fixed height. Hero has explicit `calc(100vh - 56px)` height. No content shifts. |
| FCP | < 1.5s | Server Component renders HTML immediately. Client components hydrate after. |

### 7.2 Animation Budget

| Zone | Rule |
|---|---|
| Aurora background | CSS only — zero JS cost, zero paint triggers |
| All Framer Motion | `transform` and `opacity` only. Never animate `height`, `width`, `top`, `left`, `margin`, or `padding`. |
| Floating code (A9) | Maximum 6 simultaneously. Opacity capped at 0.08. |
| Stats counter (A7) | `useMotionValue` + `useTransform` — no DOM write per frame |
| Typewriter (A4) | `useState` with `useEffect` interval. Clears interval on unmount. |

### 7.3 Bundle Impact

No new npm packages are added. The entire upgrade uses:
- Framer Motion v11 (already in bundle)
- lucide-react (already in bundle)
- Tailwind CSS (zero runtime cost)
- Native CSS animations (zero JS)

**Expected bundle delta: ~0KB** (no new dependencies, only new component files that tree-shake cleanly).

### 7.4 Server vs Client Split

`app/page.tsx` is a **Server Component**. It:
- Calls `getAllNetworks()` (server-side, no client JS needed)
- Imports all `components/landing/*.tsx` client components
- Renders static HTML shell instantly

All animation logic lives in `components/landing/` client components. They hydrate after first paint, so the page is readable before JavaScript executes.

```tsx
// app/page.tsx — Server Component (no 'use client' directive)
import { getAllNetworks, NETWORK_COLOR_CLASSES } from '@/lib/genlayer/networks'
import HeroSection from '@/components/landing/HeroSection'
import StatsBar from '@/components/landing/StatsBar'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import NetworkStatus from '@/components/landing/NetworkStatus'
import TerminalSpotlight from '@/components/landing/TerminalSpotlight'
import CTABanner from '@/components/landing/CTABanner'

export default function HomePage() {
  const networks = getAllNetworks()  // server-side — safe

  return (
    <div className="mx-auto max-w-5xl px-4">
      <HeroSection />
      <StatsBar />
      <HowItWorksSection />
      <FeaturesSection />
      <NetworkStatus networks={networks} />
      <TerminalSpotlight />
      <CTABanner />
    </div>
  )
}
```

---

## 8. Safety Rules

These rules are non-negotiable. They protect the live production app at genshipyard.com.

| # | Rule | Why |
|---|---|---|
| 1 | **Only `app/page.tsx` is modified** | All other pages (`/deploy`, `/templates`, `/compare`, `/registry`, `/interact/[address]`) must continue to work exactly as they do now |
| 2 | **`app/globals.css` receives new `@keyframes` only — appended at bottom** | Existing CSS rules (scrollbar, font imports, base styles) must not be touched |
| 3 | **No new npm packages** | No `package.json` changes. No new imports from packages not already in `node_modules` |
| 4 | **All existing import paths preserved** | `getAllNetworks`, `NETWORK_COLOR_CLASSES`, `Link` from next/link — referenced exactly as they are now |
| 5 | **`getAllNetworks()` call preserved** | This populates the live network status grid. Must remain a server-side call |
| 6 | **Link hrefs unchanged:** `/deploy`, `/templates`, `/compare`, `/registry` | These are the primary app navigation destinations |
| 7 | **No `'use client'` on `app/page.tsx`** | It must remain a Server Component. All client logic goes into `components/landing/` files |
| 8 | **Framer Motion components in `components/landing/` only** | Each file in this directory has its own `'use client'` directive at the top |
| 9 | **Header and Sidebar untouched** | `components/layout/Header.tsx` and `Sidebar.tsx` are not imported or modified |
| 10 | **`app/icon.svg` unchanged** | The SVG file is not modified. The hero logo treatment is CSS-only (glow, filter) applied to an `<img>` tag pointing at `/icon.svg` |

### 8.1 Pre-Build Verification Checklist

Before starting implementation, verify:

```bash
# 1. Confirm Framer Motion is installed
cat package.json | grep framer-motion
# Expected: "framer-motion": "^11.x.x"

# 2. Confirm lucide-react is installed
cat package.json | grep lucide-react
# Expected: "lucide-react": "^0.x.x"

# 3. Confirm fonts are loaded
grep -n "Fira Code\|Syne" app/globals.css
# Expected: Both @import lines present

# 4. Confirm networks export
grep -n "getAllNetworks\|NETWORK_COLOR_CLASSES" lib/genlayer/networks.ts
# Expected: Both exported

# 5. Confirm build passes before touching anything
npm run build
# Expected: No errors
```

### 8.2 Post-Build Verification Checklist

After implementation, verify:

```bash
# 1. Build must pass
npm run build

# 2. All app routes must load
# Visit: /, /deploy, /templates, /compare, /registry
# None of these should show errors

# 3. Network status grid must show real network data
# Not placeholder data — getAllNetworks() must be called

# 4. No new packages in package.json
git diff package.json
# Expected: No changes
```

---

## 9. File Delivery Plan

Exactly two existing files are modified. Eight new files are created. No other files are touched.

### 9.1 Modified Files

| File | Change Description |
|---|---|
| `app/page.tsx` | Full rewrite. Server Component. Imports 7 landing components. Calls `getAllNetworks()`. No `'use client'`. |
| `app/globals.css` | Append 6 new `@keyframes` blocks and their class definitions at the end of the file. No changes to existing rules. |

### 9.2 New Files Created

| File | Size estimate | Description |
|---|---|---|
| `components/landing/HeroSection.tsx` | ~120 lines | Full hero section with all layers. Imports FloatingCode and TerminalTypewriter. |
| `components/landing/TerminalTypewriter.tsx` | ~80 lines | Typewriter animation component. Self-contained, loops. |
| `components/landing/FloatingCode.tsx` | ~60 lines | 6 drifting code fragment animations. |
| `components/landing/StatsBar.tsx` | ~60 lines | Three animated stat counters. |
| `components/landing/HowItWorksSection.tsx` | ~100 lines | 3 step cards + SVG connector. |
| `components/landing/FeaturesSection.tsx` | ~140 lines | Bento grid of 6 feature cards. |
| `components/landing/TerminalSpotlight.tsx` | ~100 lines | Two-column section with static terminal mockup. |
| `components/landing/CTABanner.tsx` | ~60 lines | Final CTA with aurora and shimmer button. |

### 9.3 Files Explicitly Not Changed

```
app/layout.tsx
app/deploy/page.tsx
app/templates/page.tsx
app/compare/page.tsx
app/registry/page.tsx
app/interact/[address]/page.tsx
app/api/generate/route.ts
app/api/registry/route.ts
components/layout/Header.tsx
components/layout/Sidebar.tsx
components/deploy/*
components/interact/*
components/registry/*
components/ui/*
components/providers/*
hooks/*
lib/*
types/*
public/*
tailwind.config.js
tsconfig.json
postcss.config.js
package.json
package-lock.json
.env.local.example
```

---

## 10. Implementation Order

Build in this exact sequence to avoid import errors and broken intermediate states.

### Phase 1 — Foundation (globals.css)

**Step 1:** Append new keyframes to `app/globals.css`

Add at the very bottom of the file, after all existing styles:
- `@keyframes aurora` + `.aurora-bg`
- `@keyframes logo-pulse` + `.logo-pulse`
- `@keyframes chromatic-pulse` + `.pulse-border`
- `@keyframes shimmer-scan` + `.shimmer-btn`
- `@keyframes dot-flash` + `.dot-1/.dot-2/.dot-3/.dot-4`
- `@keyframes chevron-bounce` + `.chevron-bounce`
- `@media (prefers-reduced-motion: reduce)` override block

Run `npm run build` — must pass before proceeding.

---

### Phase 2 — Primitive Client Components

Build these first because they are imported by section components.

**Step 2:** `components/landing/FloatingCode.tsx`
- `'use client'`
- 6 Framer Motion `motion.pre` elements with random positions and upward drift
- `useReducedMotion()` check — return null if reduced motion preferred

**Step 3:** `components/landing/TerminalTypewriter.tsx`
- `'use client'`
- `useState` for current text, `useEffect` for typing interval
- Loop: type lines → hold 2s → clear → restart
- `useReducedMotion()` — show completed text immediately if preferred

**Step 4:** `components/landing/StatsBar.tsx`
- `'use client'`
- `useMotionValue`, `useTransform`, `animate` from Framer Motion
- Three pills with counter animation
- `useReducedMotion()` — show final numbers immediately if preferred

---

### Phase 3 — Section Components

Build each section independently. Each is a `'use client'` component.

**Step 5:** `components/landing/HeroSection.tsx`
- Imports: `FloatingCode`, `TerminalTypewriter` from Phase 2
- Imports: `Link` from next/link, `ChevronDown` from lucide-react
- All hero layers implemented
- `ShipyardHeroLogo` defined inline (small — no separate file needed)

**Step 6:** `components/landing/HowItWorksSection.tsx`
- Imports: `Upload`, `Settings`, `Rocket` from lucide-react
- Imports: `motion` from framer-motion
- Step cards + SVG connector with `pathLength` animation
- `useReducedMotion()` check on connector animation

**Step 7:** `components/landing/FeaturesSection.tsx`
- Imports: `Sparkles`, `Zap`, `LayoutTemplate`, `GitCompare`, `Database`, `Terminal` from lucide-react
- Imports: `motion` from framer-motion
- Bento grid with 6 cards
- CSS Grid layout for bento — use inline `style` or Tailwind `col-span` utilities

**Step 8:** `components/landing/TerminalSpotlight.tsx`
- No Framer Motion in the terminal itself (static)
- `motion` used only for scroll reveal of the two columns
- `Link` from next/link for the CTA

**Step 9:** `components/landing/CTABanner.tsx`
- Imports: `Link` from next/link, `ArrowRight` from lucide-react
- Aurora background via `.aurora-bg` CSS class
- Shimmer button via `.shimmer-btn` CSS class
- `FloatingCode` with reduced fragment count (prop: `count={4}`, `speed="slow"`)

---

### Phase 4 — NetworkStatus (special — receives server props)

**Step 10:** `components/landing/NetworkStatus.tsx`
- `'use client'` — only for Framer Motion scroll reveal
- Receives `networks` and color classes as props from the Server Component
- Does NOT call `getAllNetworks()` itself — that stays in `app/page.tsx`

```tsx
// components/landing/NetworkStatus.tsx
'use client'
import type { Network, NetworkId } from '@/types'
import type { NETWORK_COLOR_CLASSES } from '@/lib/genlayer/networks'

interface Props {
  networks: Network[]
  colorClasses: typeof NETWORK_COLOR_CLASSES
}

export default function NetworkStatus({ networks, colorClasses }: Props) {
  // render the 4 network cards
}
```

---

### Phase 5 — Page Assembly

**Step 11:** `app/page.tsx` — full rewrite

```tsx
// app/page.tsx — NO 'use client'
import { getAllNetworks, NETWORK_COLOR_CLASSES } from '@/lib/genlayer/networks'
import HeroSection from '@/components/landing/HeroSection'
import StatsBar from '@/components/landing/StatsBar'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import NetworkStatus from '@/components/landing/NetworkStatus'
import TerminalSpotlight from '@/components/landing/TerminalSpotlight'
import CTABanner from '@/components/landing/CTABanner'

export default function HomePage() {
  const networks = getAllNetworks()

  return (
    <div className="mx-auto max-w-5xl px-4">
      <HeroSection />
      <StatsBar />
      <section id="how-it-works" className="py-16 md:py-24">
        <HowItWorksSection />
      </section>
      <section id="features" className="py-16 md:py-24">
        <FeaturesSection />
      </section>
      <section id="networks" className="py-16 md:py-24">
        <NetworkStatus networks={networks} colorClasses={NETWORK_COLOR_CLASSES} />
      </section>
      <section className="py-16 md:py-24">
        <TerminalSpotlight />
      </section>
      <section className="py-16 md:py-24">
        <CTABanner />
      </section>
    </div>
  )
}
```

---

### Phase 6 — Verification

**Step 12:** TypeScript check

```bash
npx tsc --noEmit
# Must return zero errors
```

**Step 13:** Build check

```bash
npm run build
# Must complete successfully
```

**Step 14:** Runtime verification

```bash
npm run dev
```

Visit and verify:
- `http://localhost:3000` — all 7 sections render
- `http://localhost:3000/deploy` — deploy page works exactly as before
- `http://localhost:3000/templates` — templates page works
- `http://localhost:3000/compare` — compare page works
- `http://localhost:3000/registry` — registry page works
- Network status grid shows 4 real networks (not placeholder data)
- Terminal typewriter loops correctly
- Aurora background animates in hero and CTA
- All CTA links point to correct routes
- No console errors

**Step 15:** Reduced motion check

In browser DevTools → Rendering → Emulate CSS media feature → `prefers-reduced-motion: reduce`

Verify:
- All CSS animations stopped (aurora, logo pulse, shimmer, dots)
- All Framer Motion animations skipped (cards appear in final position)
- Typewriter shows completed text immediately

---

*Document prepared for Shipyard landing page upgrade. All design decisions trace to the existing Shipyard brand, the chromatic glass system, or specific product capabilities documented in the app's README. Nothing is decorative for decoration's sake. Every section earns its place.*

*Emerald. Dark. Sharp. Alive.*
