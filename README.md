# Sakhi Standalone Companion

This folder contains the self-contained extraction of the **Sakhi AI Companion** from JanmaSethu:
- **Sakhi Landing Page (`/` or `/sakhi`)**: Features the hero presentation, value proposition, how it works, why choose Sakhi, social proof, interactive demo, and FAQs.
- **Full Companion Chat (`/sakhi/try`)**: Full interactive chat companion interface with instant answers, contextual responses, and multilingual input.

## Zero-Config: No `.env` Required

All configuration values have built-in production fallbacks:
- Port: `5100` (configurable via `PORT` environment variable if desired)
- Sakhi AI API: `http://72.61.228.9:8000`
- Webapp API: `http://72.61.228.9:8100`
- If remote services are ever unreachable, the app automatically fails over to its internal intelligent fallback engine so the UI and chat never crash.

## How to Run

### Development Mode (Express + Vite)
```bash
cd sakhi-standalone
npm run dev
```
Open **`http://localhost:5100`** in your browser.
- Landing page: `http://localhost:5100/` or `http://localhost:5100/sakhi`
- Full companion chat: `http://localhost:5100/sakhi/try`

### Production Build
```bash
npm run build
npm start
```
