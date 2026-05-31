import ReactMarkdown from "react-markdown"
import SourceTag from "./SourceTag"
import { User, Bot } from "lucide-react"

function Message({ role, content, sources = [], onVerPagina }) {
  const esUsuario = role === "user"

  return (
    <div className={`flex gap-3 ${esUsuario ? "flex-row-reverse" : ""}`}>
      
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1
        ${esUsuario ? "bg-gray-700" : "bg-teal-900 border border-teal-700"}`}>
        {esUsuario 
          ? <User size={16} className="text-gray-300" />
          : <Bot size={16} className="text-teal-400" />
        }
      </div>

      <div className={`max-w-xl flex flex-col gap-2 ${esUsuario ? "items-end" : "items-start"}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${esUsuario
            ? "bg-teal-700 text-white rounded-tr-sm"
            : "bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-sm"
          }`}>
          {esUsuario ? (
            content
          ) : (
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-base font-bold mb-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-sm font-bold mb-1 mt-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-sm font-semibold mb-1" {...props} />,
                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="text-sm" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
                code: ({node, ...props}) => <code className="bg-gray-700 px-1 rounded text-xs" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>

        {sources.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-600 uppercase tracking-wider">Fuentes</p>
            <div className="flex flex-wrap gap-2">
              {sources.map((s, i) => (
                <SourceTag key={i} filename={s.filename} page={s.page}
                  url={s.url} docId={s.doc_id} texto={s.texto} onVerPagina={onVerPagina} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Message