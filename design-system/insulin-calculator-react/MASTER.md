# Design System Master File (LDS Edition)

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** PikafikaLife
**Generated:** 2026-04-24 15:22:15
**Design System:** LINE Design System (LDS)
**Category:** Healthcare Companion

---

## Global Rules

### Color Palette (LDS Brand)

| Role | Hex | Tailwind Class |
|------|-----|--------------|
| Brand Green | `#06C755` | `bg-brand-500` / `text-brand-500` |
| Brand Light | `#CEF3DE` | `bg-brand-100` |
| Brand Deep | `#05B34C` | `text-brand-600` |
| Bg Main | `#F8F9FA` | `bg-bg-main` |
| Text Main | `#111111` | `text-text-main` |
| Text Sub | `#666666` | `text-text-sub` |
| Text Muted | `#A1A1A1` | `text-text-muted` |

**Color Notes:** LINE Green is the primary anchor. Use pure white backgrounds for cards and off-white for the main page background.

### Typography (LDS Style)

- **Main Font:** Pretendard, Inter, or Noto Sans KR
- **Headings:** Bold (700), Tracking -1% to -2%
- **Body:** Regular (400) or Medium (500)
- **Mood:** Minimal, Clean, Trustworthy, Modern, Sophisticated

**Typography Sizes:**
| Name | Size | Weight |
|------|------|--------|
| Display | `24px+` | Bold |
| Large | `18px` | Bold |
| Base | `15px` | Medium |
| Small | `13px` | Medium |
| Caption | `11px` | Bold |

### Spacing & Rounding

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | `12px` | Standard Cards |
| `rounded-md` | `8px` | Modals, large UI elements |
| `rounded-sm` | `4px` | Buttons, Inputs, Tags |
| `gap-md` | `16px` | Standard spacing |
| `px-6` | `24px` | Page horizontal padding |

### Shadow Tokens (LDS Flatness)

| Level | Value | Usage |
|-------|-------|-------|
| `shadow-lds` | `0 4px 12px rgba(0,0,0,0.05)` | Floating cards |
| `shadow-sm` | `0 2px 4px rgba(0,0,0,0.02)` | Interactive elements |

---

## Component Specs

### Buttons (LDS Minimal)

```css
/* lds-button-primary */
.btn-primary {
  background: #06C755;
  color: white;
  padding: 14px 20px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 14px;
}

/* lds-button-secondary */
.btn-secondary {
  background: white;
  color: #111111;
  border: 1px solid #E2E8F0;
  padding: 14px 20px;
  border-radius: 4px;
}
```

### Cards (LDS Floating)

```css
.card {
  background: white;
  border-radius: 12px;
  border: 1px solid #F1F5F9;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05); /* shadow-lds */
}
```

### Inputs (LDS Clean)

```css
.input {
  padding: 12px 16px;
  background: #F8F9FA;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 15px;
}

.input:focus {
  border-color: #06C755;
  background: white;
  outline: none;
}
```

---

## Style Guidelines

**Style:** Minimal & Sophisticated

**Keywords:** Micro-interactions, Clean borders, White-space focus, High-quality icons, No-clutter layout.

**Best For:** Everyday health management, Family sharing environments, Premium wellness apps.

### Key Effects:
- **Hover Transitions:** 300ms ease-out (opacity or color change).
- **Active States:** Subtle scale down (0.98x) for buttons.
- **Icons:** Thin-stroke SVG icons (Hugeicons or similar).

---

## Development Guide (Code Consistency)

To maintain LDS integrity during development, always prioritize the following resources:

### 1. Tailwind Design Tokens
Avoid using absolute values (e.g., `rounded-[20px]`). Instead, use our standardized tokens:

| Token | CSS Value | Usage |
|-------|-----------|-------|
| `rounded-sm` | `4px` | Buttons, Input fields, Small tags |
| `rounded-md` | `8px` | Modal headers, inner containers |
| `rounded-lg` | `12px` | **Primary Cards** (Standard LDS Card) |
| `shadow-lds` | `0 4px 12px rgba(0,0,0,0.05)` | Floating card effects |
| `bg-brand-500` | `#06C755` | Brand primary color (LINE Green) |

### 2. Standard UI Components
We provide atomic components in `src/components/ui/` that encapsulate LDS logic. **Use these whenever possible.**

- **`Button`**: `variant="primary" | "secondary" | "outline" | "ghost"`
- **`Card`**: `padding="none" | "sm" | "md" | "lg"`
- **`Input`**: Includes standard LDS focus states, labels, and error handling.

### 3. AI Assistant Instructions
When asking an AI (like Antigravity) to build new features, include this instruction:
> "Follow the LINE Design System (LDS) rules defined in `design-system/insulin-calculator-react/MASTER.md`. Use the standard UI components in `src/components/ui/` and Tailwind tokens for all styling."

---

## Anti-Patterns (Do NOT Use)

- ❌ **Heavy Shadows** — No `shadow-2xl` or dark shadow spreads.
- ❌ **Aggressive Gradients** — Avoid multi-color linear gradients; use flat colors.
- ❌ **Excessive Rounding** — Avoid `rounded-full` for everything; use `rounded-lg` or `rounded-sm`.
- ❌ **Blue Accents** — Blue is forbidden unless for mandatory safe-zones.
- ❌ **Toss-style 3D effects** — Stay flat and minimal.

---

## Pre-Delivery Checklist

- [ ] All brand colors use `#06C755` (LINE Green).
- [ ] Border radius for main cards is exactly `12px`.
- [ ] Buttons use `rounded-sm` (4px).
- [ ] Typography tracking is set to `-1%`~`-2%` for headings.
- [ ] Hover and Active states use smooth CSS transitions.
- [ ] No content layout shift on hover.
- [ ] Mobile-first screen padding (24px horizontal).
