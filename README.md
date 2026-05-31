# DocMind — RAG para PDFs

Aplicación web que permite chatear con documentos PDF usando IA.
Sube cualquier PDF y hazle preguntas — DocMind encuentra la respuesta
y te muestra exactamente en qué página está.

## Características

- Carga múltiples PDFs y consulta cada uno por separado
- Respuestas basadas únicamente en el contenido del documento
- Muestra las fuentes con número de página exacto
- Visor de PDF integrado con resaltado del texto fuente
- Historial de conversación por documento
- Búsqueda híbrida: vectorial + keyword para mayor precisión

## Stack tecnológico

**Backend**
- Python + FastAPI
- ChromaDB (base de datos vectorial)
- LangChain (chunking de documentos)
- PyMuPDF (procesamiento de PDFs)
- Claude API — claude-sonnet-4-6 (Anthropic)

**Frontend**
- React + Vite
- Tailwind CSS
- Lucide React (iconos)

## Cómo ejecutar

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Crea un archivo `.env` en la carpeta `backend`:
```
ANTHROPIC_API_KEY=tu-api-key-aqui
```

```bash
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Abre **http://localhost:5173**

## Arquitectura RAG

1. El PDF se divide en chunks de 800 tokens con overlap de 100
2. Los chunks se indexan en ChromaDB como vectores
3. La pregunta del usuario se convierte en vector y busca los chunks más similares
4. Se complementa con búsqueda por keywords para mayor cobertura
5. El contexto relevante se envía a Claude junto con la pregunta
6. Claude responde basándose únicamente en ese contexto

## Estado del proyecto

Proyecto en desarrollo activo. Mejoras planificadas:

- **Resaltado de texto más preciso**: el visor actual aproxima 
  la ubicación del texto en la página. Se está trabajando en 
  mejorar la precisión del resaltado usando coordenadas exactas 
  de PyMuPDF para marcar el fragmento exacto que originó la respuesta.
- Soporte para PDFs escaneados con OCR
- Modo multiDocumento: consultar varios PDFs simultáneamente en una misma pregunta

## Autor

Isidro Gajardo — Ingeniero en Informática  
github.com/Isidro-Gajardo