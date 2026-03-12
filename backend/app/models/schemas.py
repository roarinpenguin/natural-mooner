from pydantic import BaseModel, Field
from typing import Optional, Literal


class TranslationRequest(BaseModel):
    input_text: str = Field(..., description="The Natural Language description or Lua Script to process")
    direction: Literal["nl_to_lua", "lua_to_nl"] = Field(..., description="Translation direction")
    api_key: Optional[str] = Field(None, description="User provided OpenAI API Key (optional if server has one)")
    model: Optional[str] = Field(None, description="Selected OpenAI model")


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
    models: list[ModelInfo] = Field(..., description="Supported models available for the API key")
    default_model: str = Field(..., description="Recommended default model")


class ErrorResponse(BaseModel):
    detail: str
