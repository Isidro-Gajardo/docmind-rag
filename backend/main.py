from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from rag import indexar_pdf, consultar, obtener_coordenadas, UPLOADS_DIR, renderizar_pagina
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/pdfs", StaticFiles(directory="uploads"), name="pdfs")

@app.get("/")
def inicio():
    return {"status": "ok", "service": "DocMind RAG API"}

@app.post("/upload")
async def subir_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos PDF.")

    contenido = await file.read()
    
    try:
        doc_id, paginas = indexar_pdf(contenido, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    ruta = UPLOADS_DIR / f"{doc_id}.pdf"
    with open(ruta, "wb") as f:
        f.write(contenido)

    return {
        "doc_id": doc_id,
        "filename": file.filename,
        "pages": paginas,
        "pdf_url": f"http://localhost:8000/pdfs/{doc_id}.pdf",
        "status": "indexado"
    }

class ChatRequest(BaseModel):
    question: str
    document_ids: list[str] = []
    historial: list[dict] = []

@app.post("/chat")
def chat(request: ChatRequest):
    return consultar(
        pregunta=request.question,
        document_ids=request.document_ids,
        historial=request.historial
    )

class CoordenadasRequest(BaseModel):
    doc_id: str
    texto: str
    pagina: int

@app.post("/coordenadas")
def coordenadas(request: CoordenadasRequest):
    resultado = obtener_coordenadas(
        request.doc_id,
        request.texto,
        request.pagina
    )
    if not resultado:
        raise HTTPException(status_code=404, detail="Texto no encontrado.")
    return resultado


class PaginaRequest(BaseModel):
    doc_id: str
    pagina: int
    texto_resaltar: Optional[str] = None

@app.post("/pagina")
def obtener_pagina(request: PaginaRequest):
    resultado = renderizar_pagina(
        request.doc_id,
        request.pagina,
        request.texto_resaltar
    )
    if not resultado:
        raise HTTPException(status_code=404, detail="Página no encontrada.")
    return resultado