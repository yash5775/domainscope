# Design System Specification (DESIGN.md)
**Project:** DomainScope Pro  
**Design Philosophy:** Human-Crafted Editorial Light Mode • Swiss / Minimalist Precision • Anti-AI-Slop  
**Tech Stack:** React 19 + Vite + Vanilla CSS System + Lucide Icons + Canvas Confetti  
**Inspiration:** Linear, Stripe Dashboard, Vercel Light, Raycast, iA Writer  

---

## 1. Core Principles & Anti-AI-Slop Directives
- **Zero AI Tropes:**
  - ❌ No dark mode purple/cyan neon gradients.
  - ❌ No radioactive glowing borders or arbitrary gradient text.
  - ❌ No gratuitous floating blurry mesh blobs.
  - ❌ No emojis as interface icons (strictly clean Lucide SVGs).
  - ❌ No generic rounded pill bloat.
- **Human-Crafted Light Mode:**
  - ✅ Warm neutral paper/canvas foundation (`#f8f9fa` / `#fbfbfc`).
  - ✅ Pure white surfaces (`#ffffff`) with razor-sharp 1px hairline borders (`#e2e8f0`).
  - ✅ High-contrast deep slate ink typography (`#0f172a`).
  - ✅ Solid ink primary button (`#0f172a` with hover `#1e293b`).
  - ✅ Calm, desaturated status indicators (soft sage green `#f0fdf4` / `#15803d` for available; muted slate `#f8fafc` / `#64748b` for registered).
  - ✅ Monospace alignment for tabular figures, status codes, and domain names (`JetBrains Mono` with `tabular-nums`).

---

## 2. Color System & Semantic Tokens

### Canvas & Surface Hierarchy
```css
--canvas-bg: #f8f9fa;         /* Warm neutral background */
--surface-card: #ffffff;      /* Pure white container cards */
--surface-card-hover: #fafafa;/* Subtle card hover */
--surface-subtle: #f1f5f9;    /* Recessed areas, segmented tracks */
--surface-input: #ffffff;     /* Input fields */
--surface-table-head: #f8fafc;/* Table header */
--surface-modal: #ffffff;     /* Modal sheet */
```

### Border Hierarchy
```css
--border-subtle: #f1f5f9;     /* Row divides */
--border-default: #e2e8f0;    /* Standard hairline borders */
--border-strong: #cbd5e1;     /* Input borders, active chips */
--border-focus: #0f172a;      /* Clean ink focus ring */
```

### Typography & Text Colors
```css
--text-primary: #0f172a;      /* Deep slate ink (900) */
--text-secondary: #475569;    /* Mid slate (600) */
--text-tertiary: #64748b;     /* Sub-labels, captions (500) */
--text-muted: #94a3b8;        /* Inactive placeholders */
```

### Semantic Status Colors
```css
/* Available: Soft Sage Green */
--status-available-bg: #f0fdf4;
--status-available-border: #bbf7d0;
--status-available-text: #15803d;

/* Registered/Taken: Calm Slate */
--status-taken-bg: #f8fafc;
--status-taken-border: #e2e8f0;
--status-taken-text: #64748b;

/* Warning/Rate Limit: Warm Honey */
--status-warn-bg: #fffbeb;
--status-warn-border: #fde68a;
--status-warn-text: #b45309;
```
