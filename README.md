# SEX SLAVE DUNGEON

> *persistent city-builder — dungeon harem evil taboo — hunt your prey with the purchased tools and items.*

A massive multi-page text+emoji adult game. Runs entirely on your machine — no servers, no accounts, no telemetry.

- **Ollama** (local LLM) drives every girl's persona.
- **Kokoro TTS** runs in your browser for voice.
- **Pollinations** (optional, bring-your-own-key) generates images.
- **IndexedDB** stores your save in your browser.

Static site. Deploys to GitHub Pages unchanged. Zero build step required.

---

## Local test run (no hosting required)

Double-click **`start.bat`** on Windows (or run `./start.sh` on Mac/Linux). It:

1. Checks for Ollama on your PATH, launches it in a new window with `OLLAMA_ORIGINS=*`
2. Finds a local web server (Python / Node / PHP — whichever is installed)
3. Starts serving on `http://localhost:8080`
4. Opens your browser to the landing page

Close the server window to stop. If no local server is installed, it prints instructions.

---

## First-time visitor setup

Open the landing page (`index.html`). It walks you through:

1. **Install Ollama** — one command per OS. The site detects when Ollama comes online.
2. **Pull a model** — pick from the preset uncensored / abliterated catalog. Progress shown live.
3. **Load Kokoro** — ~80MB model weights downloaded once to your browser, then cached forever.
4. **(Optional) Pollinations key** — paste your free API key from <https://pollinations.ai> for images.

Once the four status pills are green, LAUNCH.

### CORS note

Ollama needs to allow this site's origin. Set the env var before starting Ollama:

- **Windows (PowerShell):**  `[System.Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS","*","User")`
- **Mac:** `launchctl setenv OLLAMA_ORIGINS "*"`
- **Linux:** `export OLLAMA_ORIGINS=*` (or add to your Ollama systemd override)

Then `ollama serve` (or launch the Ollama app). The setup wizard explains this per your OS.

---

## Deployment (GitHub Pages)

```bash
git init
git add .
git commit -m "SEX SLAVE DUNGEON initial"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Enable GitHub Pages: **Settings → Pages → Source: main → Save.** Site goes live at `https://<you>.github.io/<repo>/`.

No build step. No bundler. Plain HTML + JS + CSS.

### What's NOT deployed

- `.env` — local dev only, gitignored
- `js/env.local.js` — local dev only, gitignored
- `cache/` — user-specific Pollinations image cache
- `save.json` / `server/save*.json` — save data

See `.gitignore`.

---

## Local development

```bash
# serve the static files (any local server works)
npx http-server . -p 8000
# or: python3 -m http.server 8000
```

For dev-time auto-injection of a Pollinations token (so you don't have to paste it into Settings every time you wipe storage), copy `js/env.example.js` to `js/env.local.js` and fill in your token. `env.local.js` is gitignored.

---

## Privacy & Data

Nothing leaves your machine except:
- **Ollama calls** → your own local Ollama instance at `localhost:11434`. 100% local.
- **Pollinations calls (optional)** → `pollinations.ai` with *your* API key. Only if you opt in.
- **Kokoro model download** → from a public CDN on first visit. Cached forever after.

The static site itself (served from GitHub Pages) loads once. All game state, saves, and generated content live in your browser (IndexedDB) and on your disk (if you export saves).

---

## Architecture

See `docs/ARCHITECTURE.md` for the full system design.

See `docs/TODO.md` for active work + `docs/ROADMAP.md` for the 20-phase build plan.

---

## License / Disclaimer

Adult fiction. All characters in the game are adult (18+). Content is taboo and extreme by design. If that's not for you, close the tab.

This is a personal project. Not for commercial use or redistribution without permission.
