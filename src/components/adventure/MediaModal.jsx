import { useState, useEffect, useRef } from 'react';

const MediaModal = () => {
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

  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const playerRef = useRef(null);
  const widgetRef = useRef(null);
  const fullscreenContainerRef = useRef(null);
  const exitFullscreenButtonRef = useRef(null);

  // Escuchar evento para abrir el modal
  useEffect(() => {
    const handleOpenModal = (event) => {
      const { type, url } = event.detail;
      setMediaType(type);
      setMediaUrl(url);
      setIsOpen(true);
      setIsPlaying(false);
      setError(null);
      setIsLoading(true);
    };

    window.addEventListener('openMediaModal', handleOpenModal);
    return () => window.removeEventListener('openMediaModal', handleOpenModal);
  }, []);

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

  // Listener para cambios de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Ajustar el player cuando cambia el estado de fullscreen
  useEffect(() => {
    if (!playerRef.current || mediaType !== 'video') return;

    const container = playerRef.current.querySelector('div');
    if (!container) return;

    if (isFullscreen) {
      // En fullscreen, eliminar padding-bottom y hacer el contenedor ocupar todo
      container.style.paddingBottom = '0';
      container.style.height = '100%';
      container.style.width = '100%';
    } else {
      // Modo normal, restaurar aspect ratio 16:9
      container.style.paddingBottom = '56.25%';
      container.style.height = '';
      container.style.width = '100%';
    }
  }, [isFullscreen, mediaType]);

  // Cargar el player cuando se abre el modal
  useEffect(() => {
    if (!isOpen || !mediaUrl) return;

    if (mediaType === 'audio') {
      loadSoundCloud();
    } else if (mediaType === 'video') {
      loadVimeo();
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
        } else if (mediaType === 'video') {
          // Vimeo destroy
          try {
            widgetRef.current.destroy();
          } catch (err) {
            console.error('Error destroying Vimeo player:', err);
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

      if (playerRef.current) {
        playerRef.current.innerHTML = '';
        playerRef.current.appendChild(iframe);
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

      if (playerRef.current) {
        playerRef.current.innerHTML = '';
        playerRef.current.appendChild(container);
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

    // Disparar evento para notificar que el modal se cerró
    window.dispatchEvent(new CustomEvent('closeMediaModal'));
    console.log('Modal closed event dispatched'); // Debug
  };

  const handlePlayPause = () => {
    if (!widgetRef.current) return;

    if (mediaType === 'audio') {
      if (isPlaying) {
        widgetRef.current.pause();
      } else {
        widgetRef.current.play();
      }
    } else if (mediaType === 'video') {
      if (isPlaying) {
        widgetRef.current.pause();
      } else {
        widgetRef.current.play();
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

  const toggleFullscreen = async () => {
    if (!fullscreenContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        // Entrar en modo fullscreen (solo el video)
        if (fullscreenContainerRef.current.requestFullscreen) {
          await fullscreenContainerRef.current.requestFullscreen();
        } else if (fullscreenContainerRef.current.webkitRequestFullscreen) {
          await fullscreenContainerRef.current.webkitRequestFullscreen();
        } else if (fullscreenContainerRef.current.mozRequestFullScreen) {
          await fullscreenContainerRef.current.mozRequestFullScreen();
        } else if (fullscreenContainerRef.current.msRequestFullscreen) {
          await fullscreenContainerRef.current.msRequestFullscreen();
        }
      } else {
        // Salir de fullscreen
        await exitVideoFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  const exitVideoFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    } catch (err) {
      console.error('Error exiting fullscreen:', err);
    }
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[10002] bg-black/90 flex items-center justify-center p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={mediaType === 'audio' ? 'Reproductor de audio' : 'Reproductor de video'}
      style={isFullscreen ? { display: 'none' } : {}}
    >
      <div
        className="modal-content bg-white dark:bg-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {!isFullscreen && (
          <div className="flex justify-end p-4 border-b border-slate-200 dark:border-slate-700">
            <button
              ref={closeButtonRef}
              onClick={handleClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Player Container */}
        <div className={isFullscreen ? '' : 'p-6'}>
          {isLoading && !isFullscreen && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-SM-blue border-t-transparent mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">Cargando...</p>
              </div>
            </div>
          )}

          {error && !isFullscreen && (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  if (mediaType === 'audio') loadSoundCloud();
                  else if (mediaType === 'video') loadVimeo();
                }}
                className="px-4 py-2 bg-SM-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {!error && (
            <>
              {/* Fullscreen Container - wraps player and controls */}
              <div
                ref={fullscreenContainerRef}
                className={isFullscreen ? 'fullscreen-video-container' : ''}
                style={isFullscreen ? {
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  backgroundColor: '#000',
                  zIndex: 10003,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                } : {}}
              >
                {/* Exit Fullscreen Button (only visible in fullscreen) */}
                {isFullscreen && (
                  <button
                    ref={exitFullscreenButtonRef}
                    onClick={exitVideoFullscreen}
                    className="fixed top-4 right-4 z-[10004] bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-all duration-300"
                    aria-label="Salir de pantalla completa"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Media Player Container */}
                <div
                  ref={playerRef}
                  className={isFullscreen ? '' : 'mb-6'}
                  style={isFullscreen ? {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  } : {}}
                ></div>
              </div>

              {/* Custom Controls - only visible when NOT in fullscreen */}
              {!isLoading && !isFullscreen && (
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <div
                      className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer"
                      onClick={handleSeek}
                    >
                      <div
                        className="h-full bg-SM-blue rounded-full transition-all"
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    {/* Play/Pause */}
                    <button
                      onClick={handlePlayPause}
                      className="p-3 bg-SM-blue hover:bg-blue-700 text-white rounded-full transition-colors"
                      aria-label={isPlaying ? "Pausar" : "Reproducir"}
                    >
                      {isPlaying ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      )}
                    </button>

                    {/* Volume */}
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-24 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        aria-label="Volumen"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400 w-10">{volume}%</span>
                    </div>

                    {/* Fullscreen (solo para video) */}
                    {mediaType === 'video' && (
                      <button
                        onClick={toggleFullscreen}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        aria-label="Pantalla completa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaModal;