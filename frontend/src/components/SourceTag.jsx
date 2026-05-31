import { FileText } from "lucide-react"

function SourceTag({ filename, page, url, docId, texto, onVerPagina }) {
  return (
    <button onClick={() => onVerPagina({ url, page, docId, texto })}
      className="inline-flex items-center gap-1.5 text-xs bg-teal-950 text-teal-400 border border-teal-800 rounded px-2 py-1 hover:bg-teal-900 transition">
      <FileText size={12} />
      <span>{filename}</span>
      <span className="bg-teal-800 text-teal-300 rounded px-1.5 py-0.5">p.{page}</span>
    </button>
  )
}

export default SourceTag