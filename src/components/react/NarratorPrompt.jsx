import React, { useState, useEffect } from 'react';

const NarratorPrompt = ({ language = 'es' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  const messages = {
    es: {
      title: 'Sugerencia de accesibilidad',
      message: 'Active narrador del dispositivo',
      button: 'Entendido'
    },
    en: {
      title: 'Accessibility suggestion',
      message: 'Enable device narrator',
      button: 'Understood'
    }
  };

  const t = messages[language] || messages.es;

  useEffect(() => {
    // Verificar si el query parameter 'format=descriptivo' está presente
    const params = new URLSearchParams(window.location.search);
    const format = params.get('format');

    // Solo mostrar si viene del formato descriptivo y no se ha mostrado antes
    if (format === 'descriptivo' && !hasBeenShown) {
      setIsVisible(true);
      setHasBeenShown(true);

      // Auto-cerrar después de 5 segundos si el usuario no interactúa
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [hasBeenShown]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="narrator-prompt-title"
    >
      {/* Overlay con blur */}
      <div
        className="absolute inset-0 backdrop-blur-md bg-white/30 dark:bg-black/30"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full p-6 transform transition-all"
        style={{
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        <div className="text-center">
          {/* Icono de accesibilidad */}
          <div className="mx-auto w-16 h-16 mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          </div>

          <h2
            id="narrator-prompt-title"
            className="text-xl font-bold text-slate-900 dark:text-white mb-2"
          >
            {t.title}
          </h2>

          <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
            {t.message}
          </p>

          <button
            onClick={handleClose}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {t.button}
          </button>
        </div>
      </div>
    </div>
  );
};

// Añadir estilos globales para la animación
if (typeof document !== 'undefined' && !document.getElementById('narrator-prompt-styles')) {
  const style = document.createElement('style');
  style.id = 'narrator-prompt-styles';
  style.textContent = `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}

export default NarratorPrompt;