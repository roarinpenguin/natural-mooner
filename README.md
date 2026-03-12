# Natural Mooner 🌙

Natural Mooner translates **Natural Language into Lua Scripts** for [Observo.ai](https://observo.ai) pipeline transforms — and vice-versa. Powered by OpenAI, wrapped in a purple neumorphic UI, and deployable with a single Docker command.

## Demo

- [From Prompt to Lua](assets/Natural%20Mooner%20-%20from%20Prompt%20to%20LUA.mp4)
- [From Lua to Natural Language](assets/Natural%20Mooner%20-%20from%20LUA%20to%20Natural%20Language.mp4)

## What It Does

| Direction | You provide | You get |
|---|---|---|
| **NL → Lua** | A plain-English description of your logic | A ready-to-use Observo.ai Lua transform script |
| **Lua → NL** | An existing Lua script | A clear explanation of what it does |

Additional capabilities:

- **Model discovery** — automatically detects which OpenAI models your API key can access and lets you pick one.
- **Persistent settings** — API key, selected model, and usage stats are stored in your browser across sessions.
- **Cost tracking** — estimated API cost per request and cumulative total, displayed next to the settings gear.

## How to Run It

### Prerequisites

- **Docker** and **Docker Compose**
- An **OpenAI API key**

### Start

```bash
git clone <repo-url> && cd Natural\ Mooner
docker-compose up --build -d
```

Open [http://localhost:3000](http://localhost:3000).

### First-time Setup

1. Click the **gear icon** (top-right).
2. Paste your **OpenAI API key** — models load automatically.
3. Pick a model from the dropdown.
4. Start translating.

### Stop

```bash
docker-compose down
```

---

Crafted with 💜 by **RoarinPenguin**
