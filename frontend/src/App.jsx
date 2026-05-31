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

  const verPDF = (doc) => {
    setVisorPDF({
      url: doc.url,
      page: 1,
      docId: doc.id,
      texto: null
    })
  }

  const subirPDF = async (archivo) => {
    setSubiendo(true)

    const formData = new FormData()
    formData.append("file", archivo)

    try {
      const respuesta = await axios.post(
        "http://localhost:8000/upload",
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

    } catch (error) {
      const mensaje = error.response?.data?.detail || "Error al subir el PDF."
      alert(mensaje)
      console.error(error)
    }

    setSubiendo(false)
  }

  const eliminarDoc = (id) => {
    setDocumentos(prev => prev.filter(d => d.id !== id))
    if (docActivo === id) setDocActivo(null)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      <Topbar onUpload={subirPDF} subiendo={subiendo} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          documentos={documentos}
          docActivo={docActivo}
          onSeleccionar={setDocActivo}
          onEliminar={eliminarDoc}
          onVerPDF={verPDF}
        />
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