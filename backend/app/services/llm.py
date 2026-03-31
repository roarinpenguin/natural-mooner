import os
from openai import OpenAI, BadRequestError
from app.models.schemas import TranslationRequest

OBSERVO_CONTEXT = """
You are an expert Lua developer specializing in Observo.ai data transformation scripts.
Your goal is to write efficient, safe, and correct Lua code based on the user's natural language description.
Or, explain existing Lua code in simple, clear natural language.

=== OBSERVO LUA RUNTIME REQUIREMENTS ===

1. RUNTIME ENTRY POINT
The Observo Lua runtime requires exactly ONE entry point function:

function processEvent(event)
    -- your logic here
    return event  -- must return event (or nil to drop it)
end

CRITICAL:
- NEVER use function transform(event) or any other name
- ALWAYS return event at the end (or return nil to intentionally drop the event)

2. FIELD ACCESS — TABLE NOTATION ONLY
The Observo Lua runtime does NOT support method calls like event:get() or event:set().
ALWAYS use standard Lua table notation:

-- CORRECT:
local value = event["fieldName"]
local nested = event["parent"] and event["parent"]["child"]
event["newField"] = "value"

-- WRONG — will crash with "attempt to call a nil value":
event:get("fieldName")
event:set("fieldName", value)

For nested fields, ALWAYS guard against nil at each level:
local device_name = (event["device"] and event["device"]["name"]) or ""

3. HELPER FUNCTIONS MUST BE SELF-CONTAINED
The Observo Lua runtime provides NO built-in helper library. Any helper function must be
defined within the script itself, ABOVE processEvent. Never call undefined globals like
getNestedField, setNestedField, copyUnmappedFields, no_nulls, etc.

When needed, implement helpers like these:

-- Deep GET
local function getNestedField(obj, path)
    local current = obj
    for key in path:gmatch("[^%.]+") do
        if type(current) ~= "table" then return nil end
        current = current[key]
    end
    return current
end

-- Deep SET
local function setNestedField(obj, path, value)
    if value == nil then return end
    local keys = {}
    for key in path:gmatch("[^%.]+") do table.insert(keys, key) end
    local current = obj
    for i = 1, #keys - 1 do
        local k = keys[i]
        if type(current[k]) ~= "table" then current[k] = {} end
        current = current[k]
    end
    current[keys[#keys]] = value
end

4. ALWAYS WRAP LOGIC IN pcall
Every processEvent MUST wrap its main logic in pcall to prevent pipeline crashes:

function processEvent(event)
    local ok, err = pcall(function()
        -- your logic here
    end)
    if not ok then
        event["lua_error"] = tostring(err)
    end
    return event
end

5. os.time() AND os.date() — ALWAYS USE pcall
In Observo's K8s/K3s environments, os.time() with a table argument and os.date() can crash.
ALWAYS guard them:

local ok, result = pcall(function()
    return os.time({year=2024, month=1, day=1, hour=0, min=0, sec=0, isdst=false})
end)
local timestamp = ok and result or os.time()

6. TYPE SAFETY — ALWAYS USE tostring() AND tonumber()
NEVER concatenate values that could be nil or non-string:

-- CORRECT:
local log_id = "prefix-" .. tostring(event["field"] or "") .. "-" .. tostring(number)

-- WRONG — crashes if field is nil or a number:
local log_id = event["field"] .. number

7. math.randomseed — PLACE OUTSIDE processEvent
Seed the random number generator at module level, NOT inside the function:

math.randomseed(os.time())  -- top-level, runs once

function processEvent(event)
    local n = math.random(100, 999)  -- safe to use inside
    ...
end

8. NIL SAFETY CHECKLIST
Before any operation, check for nil:

| Operation             | Safe Pattern                                      |
|-----------------------|---------------------------------------------------|
| String concatenation  | tostring(val or "")                               |
| Arithmetic            | tonumber(val) or 0                                |
| Table access          | t and t["key"] or default                         |
| String methods        | if type(val) == "string" then val:match(...) end |

9. RETURNING FROM processEvent
| Return value   | Effect                                    |
|----------------|-------------------------------------------|
| return event   | Event passes through (modified or not)    |
| return result  | New table emitted downstream              |
| return nil     | Event is dropped from the pipeline        |

10. NO EXTERNAL LIBRARIES
The Observo Lua sandbox only exposes a limited set of standard Lua libraries:

AVAILABLE:
- string, table, math, os (with pcall guards)
- json.encode() / json.decode() (Observo built-in)

NOT AVAILABLE:
- No io, file, socket, require, or any external modules

=== SANITY CHECKLIST BEFORE EMITTING LUA ===
Before outputting any Lua script, verify:
[ ] Entry point is function processEvent(event)
[ ] Fields accessed via event["field"] NOT event:get()
[ ] All helper functions are defined inside the script
[ ] Main logic is wrapped in pcall
[ ] os.time({...}) / os.date() calls are wrapped in pcall
[ ] All concatenations use tostring()
[ ] math.randomseed is at the top level (if used)
[ ] Function ends with return event (or intentional return nil)
[ ] No require() or external library calls

=== OUTPUT INSTRUCTIONS ===

When generating Lua:
- Return ONLY the Lua code. No markdown formatting like ```lua.
- Include comments explaining complex parts.
- Follow Lua 5.1/5.2 syntax.
- ALWAYS follow the Observo runtime requirements above.

When explaining Lua:
- Be concise.
- Explain the logic step-by-step.
- Identify the input and output data modifications.
- Note any violations of Observo runtime requirements if present.
"""

MODEL_PRICING = {
    "gpt-4.1-mini": {"input": 0.40, "output": 1.60},
    "gpt-4.1": {"input": 2.00, "output": 8.00},
    "gpt-4.1-2025-04-14": {"input": 2.00, "output": 8.00},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    "gpt-4o": {"input": 2.50, "output": 10.00},
    "gpt-4-turbo": {"input": 10.00, "output": 30.00},
    "gpt-4": {"input": 30.00, "output": 60.00},
}

DEFAULT_MODEL_CANDIDATES = [
    "gpt-4.1-mini",
    "gpt-4o-mini",
    "gpt-4.1",
    "gpt-4.1-2025-04-14",
    "gpt-4o",
    "gpt-4-turbo",
    "gpt-4",
]

OLLAMA_DEFAULT_URL = "http://host.docker.internal:11434/v1"


class LLMService:
    def __init__(self):
        self.default_api_key = os.getenv("OPENAI_API_KEY")

    def _get_client(self, provider: str = "openai", api_key: str = None, base_url: str = None) -> OpenAI:
        if provider == "ollama":
            return OpenAI(
                api_key="ollama",
                base_url=base_url or OLLAMA_DEFAULT_URL,
            )
        elif provider == "custom":
            if not base_url:
                raise ValueError("Base URL is required for Custom provider")
            if not api_key:
                raise ValueError("API Key is required for Custom provider")
            return OpenAI(api_key=api_key, base_url=base_url)
        else:
            key = api_key or self.default_api_key
            if not key:
                raise ValueError("OpenAI API Key is required")
            return OpenAI(api_key=key)

    def list_models(self, provider: str = "openai", api_key: str = None, base_url: str = None):
        client = self._get_client(provider, api_key, base_url)
        response = client.models.list()
        available_ids = sorted({model.id for model in response.data})
        models = []

        if provider == "openai":
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
                        "id": mid,
                        "label": mid,
                        "input_cost_per_million": 0.0,
                        "output_cost_per_million": 0.0,
                    }
                    for mid in available_ids
                    if mid.startswith("gpt-")
                ]
            if not models:
                raise ValueError("No supported GPT models found for this API key")

            default_model = next(
                (c for c in DEFAULT_MODEL_CANDIDATES if any(m["id"] == c for m in models)),
                models[0]["id"],
            )

        elif provider == "ollama":
            models = [
                {
                    "id": mid,
                    "label": mid,
                    "input_cost_per_million": 0.0,
                    "output_cost_per_million": 0.0,
                }
                for mid in available_ids
            ]
            if not models:
                raise ValueError("No models found in Ollama. Pull a model first with: ollama pull <model>")
            default_model = models[0]["id"]

        else:
            for model_id in available_ids:
                pricing = MODEL_PRICING.get(model_id, {"input": 0.0, "output": 0.0})
                models.append({
                    "id": model_id,
                    "label": model_id,
                    "input_cost_per_million": pricing["input"],
                    "output_cost_per_million": pricing["output"],
                })
            if not models:
                raise ValueError("No models found on this server")
            default_model = next(
                (c for c in DEFAULT_MODEL_CANDIDATES if any(m["id"] == c for m in models)),
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

    def _call_chat(self, client, model, messages, temperature):
        try:
            return client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
            )
        except BadRequestError as e:
            if "temperature" in str(e).lower():
                print(f"Model {model} does not support custom temperature, retrying with default")
                return client.chat.completions.create(
                    model=model,
                    messages=messages,
                )
            raise

    def process_translation(self, request: TranslationRequest):
        client = self._get_client(request.provider, request.api_key, request.base_url)
        model = request.model or "gpt-4o-mini"

        if request.direction == "nl_to_lua":
            system_prompt = OBSERVO_CONTEXT + "\nTASK: Translate the following Natural Language description into a Lua Script for Observo.ai."
        else:
            system_prompt = OBSERVO_CONTEXT + "\nTASK: Explain the following Lua Script in Natural Language."

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request.input_text}
        ]
        temperature = 0.2 if request.direction == "nl_to_lua" else 0.5

        try:
            response = self._call_chat(client, model, messages, temperature)
            return {
                "result_text": response.choices[0].message.content.strip(),
                "model": model,
                "estimated_cost_usd": self._estimate_cost(model, getattr(response, "usage", None)),
            }
        except Exception as e:
            print(f"LLM Error: {e}")
            raise e
