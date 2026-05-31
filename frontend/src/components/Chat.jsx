import { useState, useRef, useEffect } from "react"
import axios from "axios"
import Message from "./Message"
import PDFViewer from "./PDFViewer"
import { MessageSquare, Send, Bot } from "lucide-react"

function Chat({ docActivo, docUrl, docId }) {
  const [historial, setHistorial] = useState({})
  const mensajes = historial[docActivo] || []
  const setMensajes = (fn) => {
    setHistorial(prev => ({
      ...prev,
      [docActivo]: typeof fn === "function" ? fn(prev[docActivo] || []) : fn
    }))
  }
  const [pregunta, setPregunta] = useState("")
  const [pensando, setPensando] = useState(false)
  const [visor, setVisor] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensajes, pensando])

  const enviar = async () => {
    if (!pregunta.trim() || !docActivo || pensando) return

    const preguntaActual = pregunta
    setPregunta("")
    setMensajes(prev => [...prev, {
      role: "user",
      content: preguntaActual,
      sources: []
    }])
    setPensando(true)

    try {
      const resultado = await axios.post("http://localhost:8000/chat", {
        question: preguntaActual,
        document_ids: [docActivo],
        historial: mensajes.slice(-4).map(m => ({
          role: m.role === "ai" ? "assistant" : "user",
          content: m.content
        }))
      })

      setMensajes(prev => [...prev, {

        role: "ai",
        content: resultado.data.answer,
        sources: resultado.data.sources.map(s => ({
          ...s,
          url: docUrl,
          doc_id: docActivo,
          texto: s.texto_original
        }))
      }])
    } catch (error) {
      setMensajes(prev => [...prev, {
        role: "ai",
        content: "Hubo un error al consultar el documento. Intenta de nuevo.",
        sources: []
      }])
    }

    setPensando(false)
  }

  const manejarTecla = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-950 overflow-hidden">

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
        {mensajes.length === 0 && !pensando && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 mt-20">
            <MessageSquare size={48} className="text-gray-700" />
            <p className="text-gray-400 font-medium text-lg">
              {docActivo
                ? "¿Qué quieres saber sobre este documento?"
                : "Selecciona un documento del panel izquierdo"
              }
            </p>
            {docActivo && (
              <div className="flex flex-col gap-2 mt-4">
                {[
                  "¿De qué trata este documento?",
                  "Resume los puntos principales",
                  "¿Cuáles son las conclusiones?"
                ].map((sugerencia, i) => (
                  <button
                    key={i}
                    onClick={() => setPregunta(sugerencia)}
                    className="text-sm text-gray-500 border border-gray-800 rounded-lg px-4 py-2 hover:border-teal-700 hover:text-teal-400 transition"
                  >
                    {sugerencia}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {mensajes.map((msg, i) => (
          <Message
            key={i}
            role={msg.role}
            content={msg.content}
            sources={msg.sources}
            onVerPagina={setVisor}
          />
        ))}

        {pensando && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-900 border border-teal-700 flex items-center justify-center text-sm">
              <Bot size={16} className="text-teal-400" />
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-6 py-4 border-t border-gray-800 bg-gray-900">
        <div className="flex gap-3 items-end bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus-within:border-teal-600 transition">
          <textarea
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            onKeyDown={manejarTecla}
            placeholder={docActivo ? "Escribe tu pregunta..." : "Selecciona un documento primero..."}
            disabled={!docActivo || pensando}
            rows={1}
            className="flex-1 bg-transparent text-gray-200 text-sm placeholder-gray-600 outline-none resize-none"
            style={{ maxHeight: "120px" }}
            onInput={(e) => {
              e.target.style.height = "auto"
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
            }}
          />
          <button
            onClick={enviar}
            disabled={!pregunta.trim() || !docActivo || pensando}
            className="bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg w-8 h-8 flex items-center justify-center transition flex-shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-xs text-gray-700 mt-2 text-center">
          Enter para enviar · Shift+Enter nueva línea
        </p>
      </div>

      {visor && (
        <PDFViewer
          url={visor.url}
          paginaInicial={visor.page}
          docId={visor.docId}
          textoResaltar={visor.texto}
          onCerrar={() => setVisor(null)}
        />
      )}
    </div>
  )
}

export default Chat