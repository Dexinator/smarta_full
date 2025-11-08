import { useState, useEffect } from 'react';

const MobileVideoControls = ({
  language = 'es',
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Textos de accesibilidad bilingües
  const ariaTexts = {
    es: {
      play: 'Reproducir video',
      pause: 'Pausar video',
      mute: 'Silenciar video',
      unmute: 'Activar sonido del video',
      fullscreen: 'Ver en pantalla completa',
    },
    en: {
      play: 'Play video',
      pause: 'Pause video',
      mute: 'Mute video',
      unmute: 'Unmute video',
      fullscreen: 'View fullscreen',
    }
  };

  const t = ariaTexts[language] || ariaTexts.es;

  // Escuchar cambios de estado del video
  useEffect(() => {
    const handleStateChange = (e) => {
      if (e.detail) {
        setIsPlaying(e.detail.isPlaying);
        setIsMuted(e.detail.isMuted);
        setIsReady(e.detail.isReady);
      }
    };

    window.addEventListener('heroVideoStateChange', handleStateChange);
    return () => window.removeEventListener('heroVideoStateChange', handleStateChange);
  }, []);

  // Enviar comandos al video
  const sendCommand = (command) => {
    const event = new CustomEvent('heroVideoCommand', {
      detail: { command }
    });
    window.dispatchEvent(event);
  };

  const handlePlayPause = () => {
    sendCommand('playPause');
  };

  const handleToggleMute = () => {
    sendCommand('mute');
  };

  const handleFullscreen = () => {
    sendCommand('fullscreen');
  };

  if (!isReady) {
    return null;
  }

  return (
    <div className={`mobile-video-controls ${className}`}>
      <div className="flex items-center justify-center gap-4 p-3 bg-black/80 backdrop-blur-sm rounded-full">
        {/* Play/Pause */}
        <button
          onClick={handlePlayPause}
          className="p-3 text-white hover:text-SM-yellow active:scale-95 transition-all"
          aria-label={isPlaying ? t.pause : t.play}
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {isPlaying ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6"/>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
            )}
          </svg>
        </button>

        {/* Volumen */}
        <button
          onClick={handleToggleMute}
          className={`p-3 text-white hover:text-SM-yellow active:scale-95 transition-all relative ${isMuted ? 'animate-pulse' : ''}`}
          aria-label={isMuted ? t.unmute : t.mute}
        >
          {isMuted && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-SM-yellow opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-SM-yellow"></span>
            </span>
          )}
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {isMuted ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"/>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
            )}
          </svg>
        </button>

        {/* Pantalla completa */}
        <button
          onClick={handleFullscreen}
          className="p-3 text-white hover:text-SM-yellow active:scale-95 transition-all"
          aria-label={t.fullscreen}
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MobileVideoControls;