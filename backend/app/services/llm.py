import os
from openai import OpenAI
from app.models.schemas import TranslationRequest

# Context from the user requirements
OBSERVO_CONTEXT = """
You are an expert Lua developer specializing in Observo.ai data transformation scripts.
Your goal is to write efficient, safe, and correct Lua code based on the user's natural language description.
Or, explain existing Lua code in simple, clear natural language.

Reference for Observo.ai Lua Scripts:
- Use the 'transform' function if applicable.
- Observo.ai specific functions may include:
  - event:get(path): Get value from event
  - event:set(path, value): Set value in event
  - event:delete(path): Delete field
  - json.decode(str): Parse JSON
  - json.encode(obj): Stringify JSON
  
When generating Lua:
- Return ONLY the Lua code. No markdown formatting like ```lua.
- Include comments explaining complex parts.
- Follow Lua 5.1/5.2 syntax (standard for many embedded systems).

When explaining Lua:
- Be concise.
- Explain the logic step-by-step.
- Identify the input and output data modifications.
"""

MODEL_PRICING = {
    "gpt-4.1-mini": {"input": 0.40, "output": 1.60},
    "gpt-4.1": {"input": 2.00, "output": 8.00},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    "gpt-4o": {"input": 2.50, "output": 10.00},
    "gpt-4-turbo": {"input": 10.00, "output": 30.00},
    "gpt-4": {"input": 30.00, "output": 60.00},
}

DEFAULT_MODEL_CANDIDATES = [
    "gpt-4.1-mini",
    "gpt-4o-mini",
    "gpt-4.1",
    "gpt-4o",
    "gpt-4-turbo",
    "gpt-4",
]

class LLMService:
    def __init__(self):
        self.default_api_key = os.getenv("OPENAI_API_KEY")

    def _get_client(self, user_api_key: str = None) -> OpenAI:
        api_key = user_api_key or self.default_api_key
        if not api_key:
            raise ValueError("OpenAI API Key is required")
        return OpenAI(api_key=api_key)

    def list_models(self, user_api_key: str = None):
        client = self._get_client(user_api_key)
        response = client.models.list()
        available_ids = sorted({model.id for model in response.data})
        models = []

        for model_id in available_ids:
            if model_id in MODEL_PRICING:
                pricing = MODEL_PRICING[model_id]
                models.append({
                    "id": model_id,
                    "label": model_id,
                    "input_cost_per_million": pricing["input"],
                    "output_cost_per_million": pricing["output"],
                })

        if not models:
            models = [
                {
                    "id": model_id,
                    "label": model_id,
                    "input_cost_per_million": 0.0,
                    "output_cost_per_million": 0.0,
                }
                for model_id in available_ids
                if model_id.startswith("gpt-")
            ]

        if not models:
            raise ValueError("No supported GPT models found for this API key")

        default_model = next(
            (candidate for candidate in DEFAULT_MODEL_CANDIDATES if any(model["id"] == candidate for model in models)),
            models[0]["id"],
        )

        return {"models": models, "default_model": default_model}

    def _estimate_cost(self, model: str, usage) -> float:
        pricing = MODEL_PRICING.get(model)
        if not pricing or usage is None:
            return 0.0

        prompt_tokens = getattr(usage, "prompt_tokens", 0) or 0
        completion_tokens = getattr(usage, "completion_tokens", 0) or 0
        total = (
            (prompt_tokens / 1_000_000) * pricing["input"] +
            (completion_tokens / 1_000_000) * pricing["output"]
        )
        return round(total, 6)

    def process_translation(self, request: TranslationRequest):
        client = self._get_client(request.api_key)
        model = request.model or "gpt-4o-mini"
        
        if request.direction == "nl_to_lua":
            system_prompt = OBSERVO_CONTEXT + "\nTASK: Translate the following Natural Language description into a Lua Script for Observo.ai."
        else:
            system_prompt = OBSERVO_CONTEXT + "\nTASK: Explain the following Lua Script in Natural Language."

        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": request.input_text}
                ],
                temperature=0.2 if request.direction == "nl_to_lua" else 0.5,
            )
            return {
                "result_text": response.choices[0].message.content.strip(),
                "model": model,
                "estimated_cost_usd": self._estimate_cost(model, getattr(response, "usage", None)),
            }
        except Exception as e:
            print(f"LLM Error: {e}")
            raise e
