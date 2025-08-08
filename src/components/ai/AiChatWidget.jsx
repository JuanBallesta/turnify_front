import { useState } from "react";
import axios from "axios";
import Turny from "/Turny.png";
import { FiMessageSquare, FiX, FiSend } from "react-icons/fi"; // Íconos para una mejor UI

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]); // Para guardar conversación
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleOpen = () => setOpen(!open);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = { type: "user", text: question };
    setChatHistory((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);
    setQuestion(""); // Limpiar input inmediatamente

    try {
      const response = await axios.post("http://localhost:3000/ai/ask", {
        question,
      });
      const botMessage = { type: "bot", text: response.data.answer };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (err) {
      setError("No se pudo obtener una respuesta. Intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón Flotante */}
      <button
        onClick={toggleOpen}
        className="fixed bottom-5 right-5 h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 z-50 p-0 border-none"
        aria-label="Abrir chat de IA"
        title="Asistente Virtual"
      >
        {open ? (
          // Cuando está abierto, muestra el ícono de cerrar (X)
          <FiX size={28} className="text-violet-600" />
        ) : (
          // Cuando está cerrado, muestra la imagen
          <img
            src={Turny}
            alt="Asistente Turny"
            className="h-full w-full object-cover rounded-full"
          />
        )}
      </button>

      {/* Ventana del Chat */}
      {open && (
        <div className="fixed bottom-24 right-5 w-80 max-w-[calc(100vw-2.5rem)] bg-white rounded-lg shadow-2xl flex flex-col max-h-[70vh] z-50 border-2 border-violet-600">
          {/* Header del Chat */}
          <div className="flex items-center p-4 border-b bg-gray-50 rounded-t-lg">
            <img
              src={Turny}
              alt="Logo AI Turny"
              className="h-8 w-8 rounded-full mr-3"
            />
            <div>
              <h3 className="font-semibold text-violet-800">Asistente Turny</h3>
              <p className="text-xs text-violet-500">
                Hola, soy Turny. Asistente virtual de Turnify. ¿En qué puedo
                ayudarte?
              </p>
            </div>
          </div>

          {/* Historial de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${msg.type === "user" ? "bg-violet-600 text-white" : "bg-gray-200 text-gray-800"}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 rounded-lg px-3 py-2">
                  Escribiendo...
                </div>
              </div>
            )}
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>

          {/* Input para Preguntar */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t flex items-center gap-2"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Escribe tu consulta..."
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-violet-500 focus:outline-none"
              disabled={loading}
            />
            {/* --- BOTÓN CORREGIDO --- */}
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="bg-violet-600 text-white p-2 rounded-md hover:bg-violet-700 disabled:bg-violet-300 disabled:cursor-not-allowed transition-colors"
            >
              <FiSend size={20} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
