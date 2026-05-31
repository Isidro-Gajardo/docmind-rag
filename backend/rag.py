from dotenv import load_dotenv
load_dotenv()

import os
import uuid
import anthropic
import chromadb
import fitz
from pathlib import Path
from langchain_text_splitters import RecursiveCharacterTextSplitter
import base64

UPLOADS_DIR = Path("./uploads")
UPLOADS_DIR.mkdir(exist_ok=True)

chroma = chromadb.PersistentClient(path="./chroma_db")
coleccion = chroma.get_or_create_collection(name="docmind")

splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=100
)

cliente_claude = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

def generar_respuesta(contexto, pregunta, historial=[]):
    mensajes = []

    for msg in historial:
        mensajes.append({
            "role": msg["role"],
            "content": msg["content"]
        })

    mensajes.append({
        "role": "user",
        "content": f"Contexto:\n{contexto}\n\nPregunta: {pregunta}"
    })

    respuesta = cliente_claude.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        system="""Eres un asistente que responde preguntas 
        basándose ÚNICAMENTE en el contexto proporcionado.
        REGLAS ESTRICTAS:
        - Cada fragmento del contexto tiene una etiqueta [Página X]
        - Cuando menciones en qué página aparece algo, usa EXACTAMENTE el número de página de la etiqueta [Página X] del fragmento donde lo encontraste
        - NUNCA inventes páginas ni supongas páginas
        - Si la información está en [Página 1], di página 1
        - Si no encuentras la información, dilo claramente
        - Responde en el mismo idioma de la pregunta""",
        messages=mensajes
    )

    return respuesta.content[0].text

def indexar_pdf(contenido_bytes, nombre_archivo):
    pdf = fitz.open(stream=contenido_bytes, filetype="pdf")
    doc_id = str(uuid.uuid4())

    chunks = []
    ids = []
    metadatas = []

    for num, pagina in enumerate(pdf, start=1):
        texto = pagina.get_text().strip()
        if not texto:
            continue

        partes = splitter.split_text(texto)

        for i, parte in enumerate(partes):
            chunks.append(parte)
            ids.append(f"{doc_id}_p{num}_c{i}")
            metadatas.append({
                "doc_id": doc_id,
                "filename": nombre_archivo,
                "page": num
            })

    if not chunks:
        raise ValueError("El PDF no contiene texto extraíble. Puede ser un documento escaneado.")

    coleccion.upsert(
        documents=chunks,
        ids=ids,
        metadatas=metadatas
    )

    return doc_id, len(pdf)

def consultar(pregunta, document_ids=[], historial=[]):
    where = {"doc_id": {"$in": document_ids}} if document_ids else None

    resultados = coleccion.query(
        query_texts=[pregunta],
        n_results=5,
        where=where,
        include=["documents", "metadatas"]
    )

    palabras = [p for p in pregunta.split() if len(p) > 4]

    chunks_extra = []
    if palabras and document_ids:
        todos = coleccion.get(
            where=where,
            include=["documents", "metadatas"]
        )
        for doc, meta in zip(todos["documents"], todos["metadatas"]):
            for palabra in palabras:
                if palabra.lower() in doc.lower():
                    chunks_extra.append((doc, meta))
                    break
            if len(chunks_extra) >= 3:
                break

    if not resultados["documents"][0] and not chunks_extra:
        return {
            "answer": "No encontré información relevante en el documento.",
            "sources": []
        }

    contexto = ""
    fuentes = []
    paginas_vistas = set()

    for doc, meta in zip(resultados["documents"][0], resultados["metadatas"][0]):
        clave = f"{meta['doc_id']}_p{meta['page']}"
        if clave not in paginas_vistas:
            contexto += f"[Página {meta['page']}]\n{doc}\n\n"
            fuentes.append({
                "filename": meta["filename"],
                "page": meta["page"],
                "texto_original": doc[:80]
            })
            paginas_vistas.add(clave)

    for doc, meta in chunks_extra:
        clave = f"{meta['doc_id']}_p{meta['page']}"
        if clave not in paginas_vistas:
            contexto += f"[Página {meta['page']}]\n{doc}\n\n"
            fuentes.append({
                "filename": meta["filename"],
                "page": meta["page"],
                "texto_original": doc[:80]
            })
            paginas_vistas.add(clave)

    answer = generar_respuesta(contexto, pregunta, historial)

    return {
        "answer": answer,
        "sources": fuentes
    }

def obtener_coordenadas(doc_id, texto, pagina):
    ruta = UPLOADS_DIR / f"{doc_id}.pdf"
    if not ruta.exists():
        return None

    import re
    texto_limpio = re.sub(r'\s+', ' ', texto)
    texto_limpio = re.sub(r'[^\w\s\.\,\-]', '', texto_limpio)
    texto_limpio = texto_limpio.strip()

    fragmentos = [texto_limpio[:60], texto_limpio[:40], texto_limpio[:20]]

    pdf = fitz.open(ruta)
    page = pdf[pagina - 1]

    for fragmento in fragmentos:
        if len(fragmento.strip()) < 5:
            continue
        areas = page.search_for(fragmento)
        if areas:
            rect = areas[0]
            return {
                "x1": rect.x0,
                "y1": rect.y0,
                "x2": rect.x1,
                "y2": rect.y1,
                "width": page.rect.width,
                "height": page.rect.height
            }

    return None

def renderizar_pagina(doc_id, pagina, texto_resaltar=None):
    ruta = UPLOADS_DIR / f"{doc_id}.pdf"
    if not ruta.exists():
        return None

    pdf = fitz.open(ruta)

    if pagina < 1 or pagina > len(pdf):
        return None

    page = pdf[pagina - 1]

    if texto_resaltar:
        import re
        texto_limpio = re.sub(r'\s+', ' ', texto_resaltar).strip()
        texto_limpio = re.sub(r'[^\w\s\.\,\-]', '', texto_limpio).strip()

        fragmentos = [texto_limpio[:60], texto_limpio[:40], texto_limpio[:20]]

        for fragmento in fragmentos:
            if len(fragmento.strip()) < 5:
                continue
            areas = page.search_for(fragmento)
            if areas:
                for area in areas:
                    highlight = page.add_highlight_annot(area)
                    highlight.set_colors(stroke=[1, 0.8, 0])
                    highlight.update()
                break

    mat = fitz.Matrix(2.0, 2.0)
    pix = page.get_pixmap(matrix=mat)
    img_bytes = pix.tobytes("png")
    img_base64 = base64.b64encode(img_bytes).decode("utf-8")

    return {
        "imagen": img_base64,
        "width": pix.width,
        "height": pix.height,
        "total_paginas": len(pdf)
    }