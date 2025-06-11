from app.api.endpoints import vocabulary

app.include_router(vocabulary.router, prefix="/api/v1", tags=["vocabulary"]) 