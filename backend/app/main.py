from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes
import os

app = FastAPI(
    title="Natural Mooner API",
    description="Lua Script Translator and Explainer for Observo.ai",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
