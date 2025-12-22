# VUDO Landing Site

> vudo.univrs.io — "Where Systems Know What They Are"

## Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

## Stack

- **React 18** + TypeScript
- **Vite** for build
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Three.js** + React Three Fiber for 3D mycelium background
- **Cloudflare Pages** for hosting

## Structure

```
vudo-landing/
├── public/
│   └── favicon.svg          # Mitan symbol
├── src/
│   ├── components/
│   │   ├── Hero.tsx         # Hero section with title
│   │   ├── MyceliumBackground.tsx  # 3D procedural network
│   │   ├── Roadmap.tsx      # 3-year timeline
│   │   └── VevePattern.tsx  # Animated sacred geometry
│   ├── App.tsx              # Main application
│   ├── index.css            # Tailwind + global styles
│   └── main.tsx             # React entry
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── wrangler.toml            # Cloudflare config
```

## Colors

- Primary (VUDO Glow): `#00ff88`
- Secondary (Mycelium): `#8b5cf6`
- Accent (Veve Gold): `#fbbf24`
- Background: `#0a0a0f`

## Deployment

1. Build: `npm run build`
2. Deploy to Cloudflare Pages: `wrangler pages deploy dist`
3. Configure custom domain: `vudo.univrs.io`

---

*The Imaginarium awaits.* 🍄
