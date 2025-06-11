import React from "react";

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Test de Componentes UI
          </h1>
          <p className="text-xl text-gray-600">
            Verificando que Tailwind CSS funciona correctamente
          </p>
        </div>

        {/* Cards Test */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-violet-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tarjeta de Prueba
              </h3>
              <div className="w-8 h-8 bg-violet-600 rounded-full"></div>
            </div>
            <p className="text-gray-600 mb-4">
              Esta es una tarjeta de prueba para verificar que los estilos
              funcionan.
            </p>
            <button className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 transition-colors">
              Botón de Prueba
            </button>
          </div>

          <div className="bg-violet-50 rounded-lg border border-violet-300 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-violet-900">
                Tarjeta Violeta
              </h3>
              <div className="w-8 h-8 bg-violet-800 rounded-full"></div>
            </div>
            <p className="text-violet-700 mb-4">
              Esta tarjeta usa el tema violeta principal de Turnify.
            </p>
            <button className="bg-violet-800 text-white px-4 py-2 rounded-md hover:bg-violet-900 transition-colors">
              Botón Violeta
            </button>
          </div>

          <div className="bg-green-50 rounded-lg border border-green-300 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-900">
                Tarjeta Éxito
              </h3>
              <div className="w-8 h-8 bg-green-600 rounded-full"></div>
            </div>
            <p className="text-green-700 mb-4">
              Esta tarjeta representa estados de éxito.
            </p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
              Botón Verde
            </button>
          </div>
        </div>

        {/* Form Test */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Formulario de Prueba
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                className="w-full border border-violet-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-violet-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="tu@email.com"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje
            </label>
            <textarea
              rows="4"
              className="w-full border border-violet-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Escribe tu mensaje aquí..."
            ></textarea>
          </div>
          <div className="mt-6 flex space-x-4">
            <button className="bg-violet-600 text-white px-6 py-2 rounded-md hover:bg-violet-700 transition-colors">
              Enviar
            </button>
            <button className="border border-violet-300 text-violet-700 px-6 py-2 rounded-md hover:bg-violet-50 transition-colors">
              Cancelar
            </button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Estados y Badges
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800">
              Activo
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Programada
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Completada
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              Pendiente
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              Cancelada
            </span>
          </div>
        </div>

        {/* Animation Test */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Animaciones
          </h3>
          <div className="flex space-x-4">
            <div className="w-8 h-8 bg-violet-600 rounded-full animate-spin"></div>
            <div className="w-8 h-8 bg-violet-600 rounded-full animate-pulse"></div>
            <div className="w-8 h-8 bg-violet-600 rounded-full animate-bounce"></div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500">
          <p>
            Si ves esta página con estilos correctos, Tailwind CSS está
            funcionando! 🎉
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
