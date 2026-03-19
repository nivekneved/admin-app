# Travel Lounge: Strategic Admin Portal

The mission control for service providers, allowing real-time management of inventories, bookings, and site settings.

---

## 🏗️ Technical Architecture
- **Framework**: Vite + React 19.
- **UI System**: Ant Design (Ant-D) + Tailwind CSS (Custom HD Slate Palette).
- **Elite Design**: Standardized with high-definition Slate-300 borders and Outfit-900 headers for a professional executive look.

---

## 📁 Repository Structure (Production Standard)
- **src/pages/**: Administrative modules (Dashboard, Services, Bookings, Settings).
- **src/components/**: Specialized admin-only UI components (Tables, Charts, Wizards).
- **docs/**: Consolidate documentation, data samples, and build logs.
- **scripts/**: Management utility and data migration tools.
- **supabase/**: Site settings and operational SQL scripts.

---

## 🚀 Development & Production
1. **Config**: Ensure `.env` is configured with Supabase and API credentials.
2. **Launch**: `npm run dev` to start the development server.
3. **Build**: `npm run build` to generate the production-ready Vite bundle.

---

## 📖 Global Alignment
For ecosystem documentation, refer to:
- [web-app/README.md](../web-app/README.md)
- [mobile-app/README.md](../mobile-app/README.md)
- [AGENTS.md](./AGENTS.md) - Full development log.
- [GEMINI.md](./GEMINI.md) - Memory and persistent context.
