import { FileText, Eye, X, Files } from "lucide-react"

function Sidebar({ documentos, docActivo, onSeleccionar, onEliminar, onVerPDF }) {
  return (
    <div className="w-64 min-w-64 bg-gray-900 border-r border-gray-700 flex flex-col h-full">
      
      <div className="p-4 border-b border-gray-700">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
          Documentos
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {documentos.length === 0 ? (
          <div className="text-center text-gray-600 text-sm mt-8 px-4">
            <Files size={32} className="mx-auto mb-2 text-gray-700" />
            <p>Sube un PDF para comenzar</p>
          </div>
        ) : (
          documentos.map((doc) => (
            <div key={doc.id} onClick={() => onSeleccionar(doc.id)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-1 group transition
                ${docActivo === doc.id
                  ? "bg-teal-900 border border-teal-700"
                  : "hover:bg-gray-800 border border-transparent"
                }`}>
              <FileText size={18} className="text-teal-400 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 font-medium truncate">{doc.nombre}</p>
                <p className="text-xs text-gray-500">{doc.paginas} páginas</p>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={(e) => { e.stopPropagation(); onVerPDF(doc) }}
                  className="text-gray-400 hover:text-teal-400 transition p-1 rounded hover:bg-teal-900"
                  title="Ver PDF">
                  <Eye size={14} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onEliminar(doc.id) }}
                  className="text-gray-500 hover:text-red-400 transition p-1 rounded hover:bg-red-950"
                  title="Eliminar">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-600 text-center">
          {documentos.length} documento{documentos.length !== 1 ? "s" : ""} cargado{documentos.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  )
}

export default Sidebar