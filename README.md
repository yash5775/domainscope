# DomainScope 🌐

An authoritative, fast, bulk domain availability & registry price intelligence workbench. Built with **React 19**, **Vite**, and **Vanilla CSS** with a human-crafted Swiss minimalist light design.

Zero paid API keys, zero subscriptions, zero tracking — directly queries official ICANN RDAP registries and public Google DoH resolvers.

---

## ✨ Features

- **Smart Unified Parser**: Paste brand keywords (e.g. `cloudpulse`), full domains (e.g. `stripe.com`), or full URLs (e.g. `https://github.com/repo`). The engine automatically detects whether each item is an exact domain or keyword and checks them without manual mode toggling.
- **Two-Tier Verification Engine**:
  - **Tier 1 (Instant Preflight ~30ms)**: Resolves active domains via Google DNS-over-HTTPS.
  - **Tier 2 (Authoritative RDAP)**: Queries official registries directly (Verisign for `.com`/`.net`, Identity Digital for `.ai`/`.io`/`.co`).
- **Target Extensions**: Pre-configured for `.com` and `.ai` with estimated registry pricing and term rules (e.g. Anguilla 2-yr minimum rule for `.ai`). Expandable to `.io`, `.co`, `.net`, `.org`, `.dev`, `.app`, and `.in`.
- **Parallel Workers**: Configurable concurrency (3, 5, or 8 parallel checks) with live progress bar.
- **Interactive KPI Cards**: Real-time counters for Total, Available, Registered, and Rate-Limited domains. Click any card to filter the table.
- **Instant Search Filter**: Filter through hundreds of checked domains in real time.
- **Direct Registrar Links**: 1-click registration links for available domains directly targeting registrar carts.
- **Authoritative RDAP Inspector**: Inspect raw authoritative registry JSON responses with 1-click JSON copy.
- **Export Suite**: Export to CSV or generate clean formatted PDF reports with `jsPDF`.
- **Keyboard Shortcuts**: Press `⌘ + Enter` / `Ctrl + Enter` anywhere to run checks; `Esc` to close modal.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Design System**: Human-crafted Swiss Light Theme (Pure White & Stone, JetBrains Mono tabular figures, Plus Jakarta Sans)
- **PDF Generation**: `jspdf` + `jspdf-autotable`
- **Celebration Effects**: `canvas-confetti`

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
git clone https://github.com/yash5775/domainscope.git
cd domainscope
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3030](http://localhost:3030) in your browser.

### Production Build

```bash
npm run build
```

---

## 📄 License

MIT License. Free to use, modify, and distribute.
