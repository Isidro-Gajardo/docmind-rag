import { useState } from "react"
import axios from "axios"
import Topbar from "./components/Topbar"
import Sidebar from "./components/Sidebar"
import Chat from "./components/Chat"
import PDFViewer from "./components/PDFViewer"

function App() {
  const [documentos, setDocumentos] = useState([])
  const [docActivo, setDocActivo] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [visorPDF, setVisorPDF] = useState(null)
  const [sidebarAbierto, setSidebarAbierto] = useState(false)

  const verPDF = (doc) => {
    setVisorPDF({ url: doc.url, page: 1, docId: doc.id, texto: null })
  }

  const subirPDF = async (archivo) => {
    setSubiendo(true)
    const formData = new FormData()
    formData.append("file", archivo)
    try {
      const respuesta = await axios.post(
        "https://docmind-backend-pmol.onrender.com/upload",
        formData
      )
      const nuevoDoc = {
        id: respuesta.data.doc_id,
        nombre: archivo.name,
        paginas: respuesta.data.pages,
        url: respuesta.data.pdf_url
      }
      setDocumentos(prev => [...prev, nuevoDoc])
      setDocActivo(nuevoDoc.id)
      setSidebarAbierto(false)
    } catch (error) {
      const mensaje = error.response?.data?.detail || "Error al subir el PDF."
      alert(mensaje)
    }
    setSubiendo(false)
  }

  const eliminarDoc = (id) => {
    setDocumentos(prev => prev.filter(d => d.id !== id))
    if (docActivo === id) setDocActivo(null)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      <Topbar
        onUpload={subirPDF}
        subiendo={subiendo}
        onToggleSidebar={() => setSidebarAbierto(!sidebarAbierto)}
        sidebarAbierto={sidebarAbierto}
        cantDocumentos={documentos.length}
      />

      <div className="flex flex-1 overflow-hidden relative">

        {/* DESKTOP: sidebar fijo visible siempre */}
        <div className="hidden md:block flex-shrink-0">
          <Sidebar
            documentos={documentos}
            docActivo={docActivo}
            onSeleccionar={setDocActivo}
            onEliminar={eliminarDoc}
            onVerPDF={verPDF}
          />
        </div>

        {/* MÓVIL: drawer que aparece sobre el chat */}
        {sidebarAbierto && (
          <>
            {/* Overlay para cerrar al tocar fuera */}
            <div
              className="fixed inset-0 z-20 md:hidden"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              onClick={() => setSidebarAbierto(false)}
            />
            {/* Drawer */}
            <div className="fixed top-14 left-0 bottom-0 z-30 md:hidden w-64">
              <Sidebar
                documentos={documentos}
                docActivo={docActivo}
                onSeleccionar={(id) => {
                  setDocActivo(id)
                  setSidebarAbierto(false)
                }}
                onEliminar={eliminarDoc}
                onVerPDF={verPDF}
              />
            </div>
          </>
        )}

        {/* Chat siempre ocupa todo el espacio disponible */}
        <Chat
          docActivo={docActivo}
          docUrl={documentos.find(d => d.id === docActivo)?.url}
          docId={docActivo}
        />
      </div>

      {visorPDF && (
        <PDFViewer
          url={visorPDF.url}
          paginaInicial={visorPDF.page}
          docId={visorPDF.docId}
          textoResaltar={visorPDF.texto}
          onCerrar={() => setVisorPDF(null)}
        />
      )}
    </div>
  )
}

export default App