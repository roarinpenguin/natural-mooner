from pydantic import BaseModel, Field
from typing import Optional, Literal


class TranslationRequest(BaseModel):
    input_text: str = Field(..., description="The Natural Language description or Lua Script to process")
    direction: Literal["nl_to_lua", "lua_to_nl"] = Field(..., description="Translation direction")
    provider: Literal["openai", "ollama", "custom"] = Field("openai", description="LLM provider")
    api_key: Optional[str] = Field(None, description="API Key (required for openai and custom)")
    base_url: Optional[str] = Field(None, description="Custom base URL (required for ollama and custom)")
    model: Optional[str] = Field(None, description="Selected model")


class TranslationResponse(BaseModel):
    result_text: str = Field(..., description="The generated Lua script or Natural Language explanation")
    model: str = Field(..., description="The model used for the request")
    estimated_cost_usd: float = Field(..., description="Estimated request cost in USD")


class ModelInfo(BaseModel):
    id: str = Field(..., description="Model identifier")
    label: str = Field(..., description="Display label")
    input_cost_per_million: float = Field(..., description="Input cost per million tokens in USD")
    output_cost_per_million: float = Field(..., description="Output cost per million tokens in USD")


class ModelListResponse(BaseModel):
    models: list[ModelInfo] = Field(..., description="Supported models available")
    default_model: str = Field(..., description="Recommended default model")


class ErrorResponse(BaseModel):
    detail: str


class FeedbackRequest(BaseModel):
    original_prompt: str = Field(..., description="The original natural language prompt")
    generated_script: str = Field(..., description="The script that was generated but failed")
    corrected_script: str = Field(..., description="The working corrected script provided by the user")
    error_message: Optional[str] = Field(None, description="Optional error message from the failed script")


class FeedbackResponse(BaseModel):
    success: bool = Field(..., description="Whether the feedback was successfully stored")
    message: str = Field(..., description="Status message")
