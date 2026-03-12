from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import TranslationRequest, TranslationResponse, ErrorResponse, ModelListResponse
from app.services.llm import LLMService

router = APIRouter()

def get_llm_service():
    return LLMService()

@router.post("/translate", response_model=TranslationResponse, responses={500: {"model": ErrorResponse}})
async def translate(request: TranslationRequest, llm_service: LLMService = Depends(get_llm_service)):
    try:
        result = llm_service.process_translation(request)
        return TranslationResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models", response_model=ModelListResponse, responses={500: {"model": ErrorResponse}})
async def list_models(api_key: str, llm_service: LLMService = Depends(get_llm_service)):
    try:
        result = llm_service.list_models(api_key)
        return ModelListResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    return {"status": "ok"}
