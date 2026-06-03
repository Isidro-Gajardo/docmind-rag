import { BrainCircuit, Upload, Menu, X, FileText } from "lucide-react"

function Topbar({ onUpload, subiendo, onToggleSidebar, sidebarAbierto, cantDocumentos }) {
  const manejarArchivo = (e) => {
    const archivo = e.target.files[0]
    if (archivo) onUpload(archivo)
  }

  return (
    <div className="flex items-center justify-between px-4 h-14 bg-gray-900 border-b border-gray-700 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Botón hamburguesa — solo visible en móvil */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-800 transition text-gray-400 hover:text-white"
        >
          {sidebarAbierto ? <X size={20} /> : <Menu size={20} />}
          {/* Badge con cantidad de documentos */}
          {cantDocumentos > 0 && !sidebarAbierto && (
            <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {cantDocumentos}
            </span>
          )}
        </button>

        <BrainCircuit size={22} className="text-teal-400" />
        <span className="text-white font-bold text-lg">DocMind</span>
        <span className="text-xs bg-teal-900 text-teal-400 border border-teal-700 rounded px-2 py-0.5 hidden sm:inline">
          RAG
        </span>
      </div>

      <label className="cursor-pointer flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium px-3 py-2 rounded-lg transition">
        <Upload size={15} />
        <span className="hidden sm:inline">{subiendo ? "Subiendo..." : "Subir PDF"}</span>
        <span className="sm:hidden">{subiendo ? "..." : "Subir"}</span>
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={manejarArchivo}
          disabled={subiendo}
        />
      </label>
    </div>
  )
}

export default Topbar