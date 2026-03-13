# Natural Mooner 🌙

Natural Mooner translates **Natural Language into Lua Scripts** for [Observo.ai](https://observo.ai) pipeline transforms — and vice-versa. Supports **OpenAI**, **Ollama** (local), and **custom OpenAI-compatible servers**. Wrapped in a purple neumorphic UI and deployable with a single Docker command.

## Demo

- [From Prompt to Lua](assets/Natural%20Mooner%20-%20from%20Prompt%20to%20LUA.mp4)
- [From Lua to Natural Language](assets/Natural%20Mooner%20-%20from%20LUA%20to%20Natural%20Language.mp4)

## What It Does

| Direction | You provide | You get |
|---|---|---|
| **NL → Lua** | A plain-English description of your logic | A ready-to-use Observo.ai Lua transform script |
| **Lua → NL** | An existing Lua script | A clear explanation of what it does |

Additional capabilities:

- **Multi-provider** — choose between OpenAI, Ollama (local), or any custom OpenAI-compatible server.
- **Model discovery** — automatically lists available models from the selected provider.
- **Persistent settings** — provider, API key, base URL, model, and usage stats stored in your browser.
- **Cost tracking** — estimated API cost per request and cumulative total, displayed next to the settings gear.

## Supported Providers

| Provider | API Key | Base URL | Cost |
|---|---|---|---|
| **OpenAI** | Required | — | Per-token pricing |
| **Ollama** | — | `http://localhost:11434/v1` | Free (local) |
| **Custom** | Required | Required (e.g. `https://your-gateway.example.com/v1/`) | Depends on server |

## How to Run It

### Prerequisites

- **Docker** and **Docker Compose**
- One of: an **OpenAI API key**, a running **Ollama** instance, or a **custom OpenAI-compatible endpoint**

### Start

```bash
git clone <repo-url> && cd Natural\ Mooner
docker-compose up --build -d
```

Open [http://localhost:3000](http://localhost:3000).

### First-time Setup

1. Click the **gear icon** (top-right).
2. Select your **provider** (OpenAI / Ollama / Custom).
3. Enter the required credentials (API key and/or base URL).
4. Pick a model from the auto-populated dropdown.
5. Start translating.

### Stop

```bash
docker-compose down
```

---

Crafted with 💜 by **RoarinPenguin**
