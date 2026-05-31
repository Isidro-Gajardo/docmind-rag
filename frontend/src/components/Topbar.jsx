import { BrainCircuit, Upload } from "lucide-react"

function Topbar({ onUpload, subiendo }) {
  const manejarArchivo = (e) => {
    const archivo = e.target.files[0]
    if (archivo) onUpload(archivo)
  }

  return (
    <div className="flex items-center justify-between px-6 h-14 bg-gray-900 border-b border-gray-700">
      <div className="flex items-center gap-2">
        <BrainCircuit size={22} className="text-teal-400" />
        <span className="text-white font-bold text-lg">DocMind</span>
        <span className="text-xs bg-teal-900 text-teal-400 border border-teal-700 rounded px-2 py-0.5">
          RAG
        </span>
      </div>

      <label className="cursor-pointer flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
        <Upload size={15} />
        {subiendo ? "Subiendo..." : "Subir PDF"}
        <input type="file" accept=".pdf" className="hidden"
          onChange={manejarArchivo} disabled={subiendo} />
      </label>
    </div>
  )
}

export default Topbar