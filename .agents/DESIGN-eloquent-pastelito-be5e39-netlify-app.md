# Design System Inspired by My Google AI Studio App

> Auto-extracted from `https://eloquent-pastelito-be5e39.netlify.app/` on 2026-07-28

## 1. Visual Theme & Atmosphere

Friendly, approachable design with rounded shapes and generous whitespace.

The hero section leads with "eSparkOS" followed by "HRM Platform".

**Key Characteristics:**
- Playfair Display as the heading font
- Inter as the body font for all running text
- Heading weight 700, letter-spacing 0.45px
- Light/white background (#fdfbf7) as the primary canvas
- Primary accent `#d97706` used for CTAs and brand highlights
- 8 shadow level(s) detected — tinted shadows
- Rounded corners (4px+) creating a friendly, approachable feel
- Tags: light, rounded, accented, compact, monospace, serif

## 2. Color Palette & Roles

### Primary
- **Primary Accent** (`#d97706`) · `--color-primary`: Brand color, CTA backgrounds, link text, interactive highlights.
- **Secondary Accent** (`#b45309`) · `--color-secondary`: Secondary brand, hover states, complementary highlights.
- **Background** (`#fdfbf7`) · `--color-bg`: Page background, primary canvas.
- **Background Secondary** (`#faf7f2`) · `--color-bg-secondary`: Cards, surfaces, alternating sections.

### Text
- **Text Primary** (`#3c2a21`) · `--color-text`: Headings and body text.
- **Text Secondary** (`#666666`) · `--color-text-secondary`: Muted text, captions, placeholders.

### Borders & Surfaces
- **Border** (`#faf7f2`) · `--color-border`: Dividers, outlines, input borders.

### Full Extracted Palette

| # | Hex | CSS Variable | Role | Area | Contrast |
|---|---|---|---|---|---|
| 1 | `#ffffff` | `--palette-1` | button | large | text-dark |
| 2 | `#faf7f2` | `--palette-2` | section | large | text-dark |
| 3 | `#3c2a21` | `--palette-3` | text-accent | medium | text-light |
| 4 | `#92400e` | `--palette-4` | button | medium | text-light |
| 5 | `#d97706` | `--palette-5` | badge | medium | text-dark |
| 6 | `#b45309` | `--palette-6` | text-accent | small | text-light |

## 3. Typography Rules

- **Heading Font:** `Playfair Display`, sans-serif
- **Body Font:** `Inter`, sans-serif

### Type Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| H1 | Playfair Display | 18px | 700 | 22.5px | 0.45px |
| H2 | Playfair Display | 24px | 700 | 32px | normal |
| H3 | Playfair Display | 18px | 700 | 28px | normal |
| H4 | Playfair Display | 14px | 700 | 20px | normal |
| Body | IBM Plex Mono | 10px | 400 | 15px | 1px |
| Small | Inter | 14px | 600 | 20px | normal |
| Code | IBM Plex Mono | 10px | 400 | 15px | 1px |

### Type Scale

| Token | Size | Suggested Usage |
|---|---|---|
| Display | `30px` | headings |
| H1 | `24px` | headings |
| H2 | `20px` | headings |
| H3 | `18px` | headings |
| H4 | `16px` | headings |
| Body L | `14px` | body / supporting text |
| Body | `12px` | body / supporting text |
| Small | `11px` | body / supporting text |
| XS | `10px` | body / supporting text |
| Caption | `9px` | body / supporting text |

## 4. Component Stylings

### Primary Button

```css
.btn-primary {
  background: transparent;
  color: #ffffff;
  border-radius: 24px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
```

### Filled Button

```css
.btn-filled {
  background: #ffffff;
  color: #3c2a21;
  border-radius: 24px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgb(232, 226, 217);
  cursor: pointer;
}
```

### Filled Button 2

```css
.btn-filled-2 {
  background: #ffffff;
  color: #92400e;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid oklab(0.915012 0.00284085 0.0134858 / 0.3);
  cursor: pointer;
}
```

### Ghost Button

```css
.btn-ghost {
  background: transparent;
  color: #78716c;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}
```

### Filled Button 3

```css
.btn-filled-3 {
  background: #fdfbf7;
  color: #3c2a21;
  border-radius: 24px;
  padding: 8px 8px;
  font-size: 16px;
  font-weight: 400;
  border: 1px solid rgb(232, 226, 217);
  cursor: pointer;
}
```

### Ghost Button 2

```css
.btn-ghost-2 {
  background: transparent;
  color: #3c2a21;
  border-radius: 0px;
  padding: 24px 24px;
  font-size: 16px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

## 5. Layout Principles

- **Base spacing unit:** `2px` — use multiples (4px, 6px, 8px, etc.)

### Spacing Scale (extracted from real elements)

| Token | Value | Role |
|---|---|---|
| spacing-1 | `2px` | element |
| spacing-2 | `14px` | element |
| spacing-3 | `4px` | element |
| spacing-4 | `8px` | element |
| spacing-5 | `20px` | element |
| spacing-6 | `16px` | element |
| spacing-7 | `6px` | element |
| spacing-8 | `12px` | element |

### Border Radius Scale

| Token | Value | Element |
|---|---|---|
| radius-subtle | `4px` | subtle |
| radius-card | `24px` | card |
| radius-button | `8px` | button |
| radius-button | `6px` | button |
| radius-card | `32px` | card |

## 6. Depth & Elevation

| Level | Shadow | Usage |
|---|---|---|
| Low | `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0...` | Cards, subtle elevation |
| Low | `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0...` | Cards, subtle elevation |
| Low | `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0...` | Cards, subtle elevation |
| Low | `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0...` | Cards, subtle elevation |
| Low | `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0...` | Cards, subtle elevation |


## 7. Do's and Don'ts

### Do
- Use `#fdfbf7` as the primary background color
- Use `Playfair Display` for all headings and `Inter` for body text
- Use `#d97706` as the single dominant accent/CTA color
- Maintain `2px` as the base spacing unit — all gaps should be multiples
- Use rounded corners (`4px`+) consistently for all interactive elements
- Use serif fonts for headlines to maintain editorial authority
- Apply the shadow system for elevation — use the extracted shadow values
- Use weight 700 for headings to match the brand's typographic voice

### Don't
- Don't use colors outside the extracted palette without justification
- Don't substitute Playfair Display/Inter with generic alternatives
- Don't use irregular spacing — stick to 2px grid
- Don't use dark/black backgrounds — this is a light-themed design
- Don't use sharp corners — they feel hostile in this rounded design language
- Don't mix in geometric sans-serif headlines — it breaks the editorial tone
- Don't use oversized hero text — this brand uses restrained type
- Don't use pure black (#000000) for text — use `#3c2a21` instead
- Don't add decorative elements not present in the original design — no badges, ribbons, banners, or ornaments unless the source site uses them
- Don't invent UI patterns the source site doesn't have — if the original has no NEW badge, don't add one just because a red is in the palette

## 8. Responsive Behavior

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640px | Single column, stack sections, reduce font sizes ~80% |
| Tablet | 640–1024px | 2-column where appropriate, maintain spacing ratios |
| Desktop | 1024–1440px | Full layout as designed |
| Wide | > 1440px | Max-width container, center content |

- Touch targets: minimum 44×44px on mobile
- Maintain 2px base unit across breakpoints — only scale multipliers

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:  #fdfbf7
Text:        #3c2a21
Accent:      #d97706
Secondary:   #b45309
Border:      #faf7f2
```

### Example Prompts

1. "Build a hero section with a `#fdfbf7` background, `Playfair Display` heading in `#3c2a21`, and a `#d97706` CTA button with 24px radius."
2. "Create a pricing card using background `#faf7f2`, border `#faf7f2`, `Inter` for text, and 6px padding."
3. "Design a navigation bar — `#fdfbf7` background, `#3c2a21` links, `#d97706` for active state."
4. "Build a feature grid with 3 columns, 6px gap, each card using the card component style."
5. "Create a footer with `#3c2a21` background, `#fdfbf7` text, and 4px padding."

### Iteration Guide

1. Start with layout structure (sections, grid, spacing)
2. Apply colors from the palette — background first, then text, then accents
3. Set typography — font families, sizes from the type scale, weights
4. Add components — buttons, cards, inputs using the specs above
5. Apply border-radius consistently across all elements
6. Add shadows for depth — use the extracted shadow values, not defaults
7. Check responsive behavior — test mobile and tablet layouts
8. Final pass — verify all colors match, spacing is consistent, fonts are correct

## 10. CSS Custom Properties

> 11 custom properties extracted from `:root` / `html` stylesheets.

### Color Variables

| Variable | Value |
|---|---|
| `--theme-claret` | `#92400e` |
| `--theme-mustard` | `#d97706` |
| `--theme-terracotta` | `#b45309` |
| `--theme-aubergine` | `#3c2a21` |
| `--theme-parchment` | `#fdfbf7` |
| `--theme-linen` | `#e8e2d9` |
| `--theme-cream` | `#fff` |
| `--theme-chestnut` | `#3c2a21` |
| `--theme-taupe` | `#78716c` |
| `--theme-sidebar-bg` | `#faf7f2` |
| `--theme-sidebar-hover` | `#f5f1eb` |
