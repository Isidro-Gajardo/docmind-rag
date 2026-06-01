from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from rag import indexar_pdf, consultar, obtener_coordenadas, UPLOADS_DIR, renderizar_pagina
from typing import Optional

from datetime import datetime, date
from collections import defaultdict

# Límite de consultas por día por IP
LIMITE_DIARIO = 2
consultas_por_ip = defaultdict(lambda: {"count": 0, "fecha": date.today()})

def verificar_limite(ip: str):
    registro = consultas_por_ip[ip]
    
    # Si es un día nuevo, resetear contador
    if registro["fecha"] != date.today():
        registro["count"] = 0
        registro["fecha"] = date.today()
    
    if registro["count"] >= LIMITE_DIARIO:
        return False
    
    registro["count"] += 1
    return True

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

from fastapi import Request

@app.post("/chat")
def chat(request: ChatRequest, req: Request):
    ip = req.client.host
    
    if not verificar_limite(ip):
        raise HTTPException(
            status_code=429,
            detail="Has alcanzado el límite de 2 consultas por día. Vuelve mañana."
        )
    
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