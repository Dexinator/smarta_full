import { useState, useEffect, useRef } from 'react';
import LiveRegion from '../ui/LiveRegion';
import VimeoPlayerSimple from '../react/VimeoPlayerSimple.jsx';

const MediaModal = ({ language = 'es' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mediaType, setMediaType] = useState(null);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const [triggerElementRef, setTriggerElementRef] = useState(null);

  // Textos bilingües de accesibilidad
  const ariaTexts = {
    es: {
      audioPlayer: 'Reproductor de audio',
      videoPlayer: 'Reproductor de video',
      close: 'Cerrar reproductor',
      exitFullscreen: 'Salir de pantalla completa',
      loading: 'Cargando contenido...',
      error: 'Error al cargar el contenido',
      retry: 'Reintentar',
      play: 'Reproducir',
      pause: 'Pausar',
      volume: 'Control de volumen',
      volumeLevel: (level) => `Volumen al ${level} por ciento`,
      fullscreen: 'Ver en pantalla completa',
      progress: 'Barra de progreso',
      currentTime: (current, total) => `${current} de ${total}`,
      playing: 'Reproduciendo',
      paused: 'Pausado',
      ended: 'Reproducción finalizada'
    },
    en: {
      audioPlayer: 'Audio player',
      videoPlayer: 'Video player',
      close: 'Close player',
      exitFullscreen: 'Exit fullscreen',
      loading: 'Loading content...',
      error: 'Error loading content',
      retry: 'Retry',
      play: 'Play',
      pause: 'Pause',
      volume: 'Volume control',
      volumeLevel: (level) => `Volume at ${level} percent`,
      fullscreen: 'View fullscreen',
      progress: 'Progress bar',
      currentTime: (current, total) => `${current} of ${total}`,
      playing: 'Playing',
      paused: 'Paused',
      ended: 'Playback ended'
    }
  };

  const t = ariaTexts[language] || ariaTexts.es;

  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const playerRef = useRef(null);
  const widgetRef = useRef(null);
  const fullscreenContainerRef = useRef(null);
  const exitFullscreenButtonRef = useRef(null);
  const normalPlayerContainerRef = useRef(null);

  // Escuchar evento para abrir el modal
  useEffect(() => {
    const handleOpenModal = (event) => {
      const { type, url } = event.detail;
      // Guardar el elemento que abrió el modal para restaurar el foco después
      setTriggerElementRef(document.activeElement);
      setMediaType(type);
      setMediaUrl(url);
      setIsOpen(true);
      setIsPlaying(false);
      setError(null);
      setIsLoading(true);
      setLiveMessage(t.loading);
    };

    window.addEventListener('openMediaModal', handleOpenModal);
    return () => window.removeEventListener('openMediaModal', handleOpenModal);
  }, [t.loading]);

  // Focus trap y tecla Escape
  useEffect(() => {
    if (!isOpen) return;

    // Focus en el botón de cerrar al abrir
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        // Si estamos en fullscreen, salir de fullscreen primero
        if (isFullscreen) {
          exitVideoFullscreen();
        } else {
          handleClose();
        }
      }

      // Focus trap (solo si no estamos en fullscreen)
      if (e.key === 'Tab' && modalRef.current && !isFullscreen) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen]);

  // Cargar el player cuando se abre el modal
  useEffect(() => {
    if (!isOpen || !mediaUrl) return;

    if (mediaType === 'audio') {
      loadSoundCloud();
    } else if (mediaType === 'video') {
      // VimeoPlayerSimple maneja su propia carga, solo marcamos como listo
      setIsLoading(false);
    }

    return () => {
      // Limpiar el player al cerrar
      if (widgetRef.current) {
        if (mediaType === 'audio' && window.SC?.Widget) {
          // SoundCloud no tiene método destroy, solo pausar
          try {
            widgetRef.current.pause();
          } catch (err) {
            console.error('Error pausing SoundCloud:', err);
          }
        }
        widgetRef.current = null;
      }
    };
  }, [isOpen, mediaUrl, mediaType]);

  // Cargar SoundCloud
  const loadSoundCloud = async () => {
    try {
      // Cargar API de SoundCloud si no está cargada
      if (!window.SC?.Widget) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://w.soundcloud.com/player/api.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      // Crear iframe para SoundCloud (oculto, solo para control)
      const iframe = document.createElement('iframe');
      iframe.width = '100%';
      iframe.height = '0'; // Altura 0 para ocultar el iframe
      iframe.style.display = 'none'; // Ocultar completamente el iframe
      iframe.scrolling = 'no';
      iframe.frameBorder = 'no';
      iframe.allow = 'autoplay';
      iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
        mediaUrl
      )}&color=%230072c0&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`;

      // Crear contenedor para el player
      const playerContainer = document.createElement('div');
      playerContainer.appendChild(iframe);

      // Guardar referencia al contenedor
      playerRef.current = playerContainer;

      // Montar en el contenedor normal (siempre empezamos en modo normal)
      if (normalPlayerContainerRef.current) {
        normalPlayerContainerRef.current.innerHTML = '';
        normalPlayerContainerRef.current.appendChild(playerContainer);
      }

      const widget = window.SC.Widget(iframe);
      widgetRef.current = widget;

      widget.bind(window.SC.Widget.Events.READY, () => {
        setIsLoading(false);
        widget.getDuration((d) => setDuration(d));
        widget.setVolume(volume);
      });

      widget.bind(window.SC.Widget.Events.PLAY, () => setIsPlaying(true));
      widget.bind(window.SC.Widget.Events.PAUSE, () => setIsPlaying(false));
      widget.bind(window.SC.Widget.Events.FINISH, () => setIsPlaying(false));
      widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, (data) => {
        setCurrentTime(data.currentPosition);
      });
    } catch (err) {
      console.error('Error loading SoundCloud:', err);
      setError('Error al cargar el contenido');
      setIsLoading(false);
    }
  };

  // Cargar Vimeo
  const loadVimeo = async () => {
    try {
      // Cargar API de Vimeo si no está cargada
      if (!window.Vimeo) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://player.vimeo.com/api/player.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      // Extraer ID de video de la URL
      const getVimeoId = (url) => {
        const match = url.match(/vimeo\.com\/(\d+)/);
        return match ? match[1] : url;
      };

      const videoId = getVimeoId(mediaUrl);

      // Crear contenedor para Vimeo
      const container = document.createElement('div');
      container.style.width = '100%';
      container.style.paddingBottom = '56.25%'; // 16:9 aspect ratio
      container.style.position = 'relative';

      const playerDiv = document.createElement('div');
      playerDiv.style.position = 'absolute';
      playerDiv.style.top = '0';
      playerDiv.style.left = '0';
      playerDiv.style.width = '100%';
      playerDiv.style.height = '100%';

      container.appendChild(playerDiv);

      // Guardar referencia al contenedor
      playerRef.current = container;

      // Montar en el contenedor normal (siempre empezamos en modo normal)
      if (normalPlayerContainerRef.current) {
        normalPlayerContainerRef.current.innerHTML = '';
        normalPlayerContainerRef.current.appendChild(container);
      }

      const player = new window.Vimeo.Player(playerDiv, {
        id: videoId,
        width: '100%',
        responsive: true,
        autoplay: false,
        byline: false,
        portrait: false,
        title: false,
        controls: false
      });

      widgetRef.current = player;

      player.on('loaded', () => {
        setIsLoading(false);
        player.getDuration().then((d) => setDuration(d));
        player.setVolume(volume / 100);
      });

      player.on('play', () => setIsPlaying(true));
      player.on('pause', () => setIsPlaying(false));
      player.on('ended', () => setIsPlaying(false));
      player.on('timeupdate', (data) => setCurrentTime(data.seconds));
    } catch (err) {
      console.error('Error loading Vimeo:', err);
      setError('Error al cargar el contenido');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setMediaType(null);
    setMediaUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsFullscreen(false); // Reset fullscreen state

    // Restaurar el foco al elemento que abrió el modal
    setTimeout(() => {
      if (triggerElementRef && typeof triggerElementRef.focus === 'function') {
        triggerElementRef.focus();
      }
    }, 100);

    // Disparar evento para notificar que el modal se cerró
    window.dispatchEvent(new CustomEvent('closeMediaModal'));
    console.log('Modal closed event dispatched'); // Debug
  };

  const handlePlayPause = () => {
    if (!widgetRef.current) return;

    if (mediaType === 'audio') {
      if (isPlaying) {
        widgetRef.current.pause();
        setLiveMessage(t.paused);
      } else {
        widgetRef.current.play();
        setLiveMessage(t.playing);
      }
    } else if (mediaType === 'video') {
      if (isPlaying) {
        widgetRef.current.pause();
        setLiveMessage(t.paused);
      } else {
        widgetRef.current.play();
        setLiveMessage(t.playing);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);

    if (widgetRef.current) {
      if (mediaType === 'audio') {
        widgetRef.current.setVolume(newVolume);
      } else if (mediaType === 'video') {
        widgetRef.current.setVolume(newVolume / 100);
      }
    }
  };

  const handleSeek = (e) => {
    if (!widgetRef.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    if (mediaType === 'audio') {
      widgetRef.current.seekTo(newTime);
    } else if (mediaType === 'video') {
      widgetRef.current.setCurrentTime(newTime);
    }
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(true);
    setLiveMessage(language === 'es' ? 'Entrando en pantalla completa' : 'Entering fullscreen');

    // Enfocar el botón de salir después de entrar en fullscreen
    setTimeout(() => {
      exitFullscreenButtonRef.current?.focus();
    }, 100);
  };

  const exitVideoFullscreen = () => {
    setIsFullscreen(false);
    setLiveMessage(language === 'es' ? 'Saliendo de pantalla completa' : 'Exiting fullscreen');

    // Restaurar el foco al botón de fullscreen
    setTimeout(() => {
      const fullscreenBtn = modalRef.current?.querySelector('[aria-label*="fullscreen"]');
      fullscreenBtn?.focus();
    }, 100);
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal con clase condicional para fullscreen */}
      <div
        ref={modalRef}
        className={`fixed inset-0 ${isFullscreen ? 'z-[10003]' : 'z-[10002]'} ${
          isFullscreen ? 'bg-black' : 'bg-black/90'
        } flex items-center justify-center ${isFullscreen ? '' : 'p-4'}`}
        onClick={isFullscreen ? undefined : handleClose}
        role="dialog"
        aria-modal="true"
        aria-label={mediaType === 'audio' ? t.audioPlayer : t.videoPlayer}
      >
        <div
          className={`modal-content ${
            isFullscreen
              ? 'fixed inset-0 bg-black flex flex-col'
              : 'bg-white dark:bg-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - diferente para fullscreen */}
          {isFullscreen ? (
            <div className="absolute top-0 right-0 z-[10004] p-4">
              <button
                ref={exitFullscreenButtonRef}
                onClick={exitVideoFullscreen}
                className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-all duration-300 shadow-lg"
                aria-label={t.exitFullscreen}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex justify-end p-4 border-b border-slate-200 dark:border-slate-700">
              <button
                ref={closeButtonRef}
                onClick={handleClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label={t.close}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Player Container */}
          <div className={`${isFullscreen ? 'flex-1 flex items-center justify-center w-full h-full' : 'p-6'}`}>
            {isLoading && (
              <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-SM-blue border-t-transparent mb-4" aria-hidden="true"></div>
                  <p className={`${isFullscreen ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>{t.loading}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center py-12" role="alert" aria-live="assertive">
                <p className="text-red-500 mb-4">{t.error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                    if (mediaType === 'audio') loadSoundCloud();
                    else if (mediaType === 'video') loadVimeo();
                  }}
                  className="px-4 py-2 bg-SM-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t.retry}
                </button>
              </div>
            )}

            {!error && (
              <>
                {/* Renderizar player según el tipo */}
                {mediaType === 'video' ? (
                  <div className={`${isFullscreen ? 'w-full h-full max-w-[100vw] max-h-[100vh]' : 'w-full'}`}>
                    {/* Contenedor del player */}
                    <div ref={normalPlayerContainerRef} className={`${isFullscreen ? 'w-full h-full' : ''}`}>
                      <VimeoPlayerSimple
                        videoUrl={mediaUrl}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                        onVideoEnd={() => {
                          setIsPlaying(false);
                          setLiveMessage(t.ended);
                        }}
                        isFullscreen={isFullscreen}
                        language={language}
                      />
                    </div>

                    {/* Botón de fullscreen - solo visible en modo normal */}
                    {!isFullscreen && (
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={toggleFullscreen}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2"
                          aria-label={t.fullscreen}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          <span>{t.fullscreen}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Para audio, mantener la lógica existente */
                  <>
                    {/* Contenedor del player para modo normal (SoundCloud) */}
                    <div ref={normalPlayerContainerRef} className="mb-6"></div>

                    {/* Custom Controls para audio */}
                    {!isLoading && (
                      <div className="space-y-4">
                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                          <div
                            role="slider"
                            aria-label={t.progress}
                            aria-valuemin={0}
                            aria-valuemax={duration}
                            aria-valuenow={currentTime}
                            aria-valuetext={t.currentTime(formatTime(currentTime), formatTime(duration))}
                            tabIndex={0}
                            className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer"
                            onClick={handleSeek}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowLeft') {
                                const newTime = Math.max(0, currentTime - 5000);
                                widgetRef.current?.seekTo(newTime);
                              } else if (e.key === 'ArrowRight') {
                                const newTime = Math.min(duration, currentTime + 5000);
                                widgetRef.current?.seekTo(newTime);
                              }
                            }}
                          >
                            <div
                              className="h-full bg-SM-blue rounded-full transition-all"
                              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                              aria-hidden="true"
                            />
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between">
                          {/* Play/Pause */}
                          <button
                            onClick={handlePlayPause}
                            className="p-3 bg-SM-blue hover:bg-blue-700 text-white rounded-full transition-colors"
                            aria-label={isPlaying ? t.pause : t.play}
                            aria-pressed={isPlaying}
                          >
                            {isPlaying ? (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              </svg>
                            )}
                          </button>

                          {/* Volume */}
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={volume}
                              onChange={handleVolumeChange}
                              className="w-24 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                              aria-label={t.volume}
                              aria-valuetext={t.volumeLevel(volume)}
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400 w-10" aria-hidden="true">{volume}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Live Region for announcing state changes */}
        <LiveRegion
          message={liveMessage}
          politeness="polite"
          atomic={true}
        />
      </div>
    </>
  );
};

export default MediaModal;