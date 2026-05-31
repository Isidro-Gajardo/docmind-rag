import { useState, useEffect } from "react"
import axios from "axios"

function PDFViewer({ url, paginaInicial = 1, docId, textoResaltar, onCerrar }) {
  const [paginaActual, setPaginaActual] = useState(paginaInicial)
  const [totalPaginas, setTotalPaginas] = useState(null)
  const [imagen, setImagen] = useState(null)
  const [cargando, setCargando] = useState(false)

  const cargarPagina = async (pagina, texto = null) => {
    setCargando(true)
    setImagen(null)

    try {
      const resultado = await axios.post("http://localhost:8000/pagina", {
        doc_id: docId,
        pagina: pagina,
        texto_resaltar: texto
      })

      setImagen(resultado.data.imagen)
      setTotalPaginas(resultado.data.total_paginas)
    } catch (error) {
      console.error("Error cargando página:", error)
    }

    setCargando(false)
  }

  useEffect(() => {
    setPaginaActual(paginaInicial)
    if (docId) {
      cargarPagina(paginaInicial, textoResaltar)
    }
  }, [docId, paginaInicial, textoResaltar])

  const irAnterior = () => {
    const nueva = Math.max(1, paginaActual - 1)
    setPaginaActual(nueva)
    cargarPagina(nueva)
  }

  const irSiguiente = () => {
    const nueva = Math.min(totalPaginas, paginaActual + 1)
    setPaginaActual(nueva)
    cargarPagina(nueva)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden">

        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-white font-medium text-sm">Visor de documento</span>
            {totalPaginas && (
              <span className="text-xs text-gray-500">
                Página {paginaActual} de {totalPaginas}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={irAnterior}
              disabled={paginaActual <= 1 || cargando}
              className="text-gray-400 hover:text-white disabled:opacity-30 px-2 py-1 text-sm transition"
            >
              ← Anterior
            </button>
            <button
              onClick={irSiguiente}
              disabled={paginaActual >= totalPaginas || cargando}
              className="text-gray-400 hover:text-white disabled:opacity-30 px-2 py-1 text-sm transition"
            >
              Siguiente →
            </button>
            <button
              onClick={onCerrar}
              className="text-gray-400 hover:text-red-400 transition text-lg ml-2"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto flex justify-center py-4 px-4">
          {cargando && (
            <div className="flex items-center justify-center mt-20">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
              </div>
            </div>
          )}

          {imagen && !cargando && (
            <img
              src={`data:image/png;base64,${imagen}`}
              alt={`Página ${paginaActual}`}
              className="max-w-full rounded shadow-lg"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default PDFViewer