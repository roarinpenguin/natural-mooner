# Project Plan: Natural Mooner (Lua Translator)

## 1. Executive Summary
This project aims to build a production-ready, containerized web application that translates Natural Language into Lua Scripts (specifically for Observo.ai transforms) and explains existing Lua Scripts in Natural Language. The application will feature a high-end "glossy purple" neumorphic UI.

## 2. Tech Stack Selection ("Agent's Choice")

### Frontend: React (Vite) + Tailwind CSS
- **Why:** 
  - **React:** Industry standard for interactive UIs.
  - **Vite:** Extremely fast build tool and dev server.
  - **Tailwind CSS:** Utility-first framework that makes implementing custom designs (like neumorphism and glassmorphism) rapid and consistent.
  - **Lucide React:** For consistent, crisp iconography.

### Backend: Python (FastAPI)
- **Why:**
  - **FastAPI:** Modern, high-performance web framework for building APIs with Python 3.7+ based on standard Python type hints. auto-generates Swagger docs.
  - **Python:** The native language of AI/LLM integration.
  - **Pydantic:** Data validation using Python type hints.

### AI/LLM Integration: OpenAI API (GPT-4o or similar)
- **Why:** Provides the highest quality code generation and explanation capabilities currently available.
- **Configuration:** The application will allow users to input their own API Key, stored securely on the client side or passed via environment variables, ensuring no sensitive data is hardcoded.

### Database / Persistence: SQLite
- **Why:** Serverless, self-contained, and requires zero configuration. Perfect for storing conversation history or cached translations without the overhead of a full postgres container.
- **Persistence:** Data stored in a Docker volume to persist across restarts.

### Containerization: Docker & Docker Compose
- **Why:** Ensures the application works identically on any machine ("up and running" experience).

## 3. Architecture & Data Flow

1.  **Client (Browser):**
    - Users interact with the Neumorphic UI.
    - API Keys are stored in the browser's LocalStorage or passed to the backend via secure HTTP headers.
2.  **API Gateway (FastAPI):**
    - Routes: `/api/generate` (NL -> Lua), `/api/explain` (Lua -> NL), `/api/health`.
    - Middleware: CORS handling, Rate limiting (basic).
3.  **Service Layer:**
    - `LLMService`: Handles prompt engineering (contextualizing for Observo.ai) and calls the LLM provider.
4.  **Data Layer:**
    - SQLite database to store an audit log of transformations (optional, user-controlled).

## 4. UI/UX Design System
- **Theme:** Dark/Purple Mode.
- **Style:** 
  - **Neumorphism:** Soft shadows, extruded shapes for buttons/inputs.
  - **Glassmorphism:** Semi-transparent backgrounds with blur filters for panels.
  - **Palette:** Deep violets, neon purples for accents, off-white text.

## 5. Directory Structure

```text
natural-mooner/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # Entry point
│   │   ├── api/             # Route handlers
│   │   ├── core/            # Config, Security
│   │   ├── services/        # Business logic (LLM calls)
│   │   └── models/          # Pydantic models & DB schemas
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # UI Components (Buttons, Inputs, NeumorphicCards)
│   │   ├── hooks/           # Custom hooks
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── tailwind.config.js
│   └── package.json
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 6. Implementation Phases

### Phase 1: Setup & Architecture (Current)
- Initialize project structure.
- Define API contracts.

### Phase 2: Docker Environment
- Create `Dockerfile` for Backend (Python).
- Create `Dockerfile` for Frontend (Node/Nginx build).
- Create `docker-compose.yml`.

### Phase 3: Backend Implementation
- Implement FastAPI app.
- Integrate OpenAI API client.
- Create prompt templates for Lua/Observo.ai context.

### Phase 4: Frontend Implementation
- Setup React + Tailwind.
- Implement Neumorphic/Glossy CSS utility classes.
- Build Input/Output components.
- Connect to Backend API.

### Phase 5: Verification & Polish
- Self-correction pass.
- Ensure responsiveness.
- verify Docker build.
