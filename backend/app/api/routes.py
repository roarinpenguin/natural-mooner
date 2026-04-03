from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import TranslationRequest, TranslationResponse, ErrorResponse, ModelListResponse, FeedbackRequest, FeedbackResponse
from app.services.llm import LLMService
from app.services.embeddings import EmbeddingsService

router = APIRouter()

def get_llm_service():
    return LLMService()

def get_embeddings_service():
    return EmbeddingsService()

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
async def list_models(
    provider: str = "openai",
    api_key: str = None,
    base_url: str = None,
    llm_service: LLMService = Depends(get_llm_service),
):
    try:
        result = llm_service.list_models(provider, api_key, base_url)
        return ModelListResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/feedback", response_model=FeedbackResponse, responses={500: {"model": ErrorResponse}})
async def submit_feedback(
    request: FeedbackRequest,
    embeddings_service: EmbeddingsService = Depends(get_embeddings_service)
):
    try:
        success = embeddings_service.store_feedback(
            original_prompt=request.original_prompt,
            generated_script=request.generated_script,
            corrected_script=request.corrected_script,
            error_message=request.error_message
        )
        if success:
            count = embeddings_service.get_feedback_count()
            return FeedbackResponse(
                success=True,
                message=f"Feedback stored successfully. Total examples: {count}"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to store feedback")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    return {"status": "ok"}
