import { useState, useEffect, useRef } from 'react';

const VimeoPlayerSimple = ({
  videoUrl,
  isPlaying,
  setIsPlaying,
  onVideoEnd,
  isFullscreen = false,
  language = 'es'
}) => {
  const [player, setPlayer] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [vimeoSDKReady, setVimeoSDKReady] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null); // Ref para guardar la instancia del player
  const controlsTimerRef = useRef(null); // Timer para ocultar controles
  const videoContainerRef = useRef(null); // Ref para el contenedor del video

  // Textos según idioma
  const t = {
    es: {
      loading: 'Cargando video...',
      error: 'Error al cargar el video',
      viewOnVimeo: 'Ver en Vimeo',
      play: 'Reproducir',
      pause: 'Pausar',
      mute: 'Silenciar',
      unmute: 'Activar sonido',
      volume: 'Control de volumen'
    },
    en: {
      loading: 'Loading video...',
      error: 'Error loading video',
      viewOnVimeo: 'View on Vimeo',
      play: 'Play',
      pause: 'Pause',
      mute: 'Mute',
      unmute: 'Unmute',
      volume: 'Volume control'
    }
  }[language] || {
    loading: 'Cargando video...',
    error: 'Error al cargar el video',
    viewOnVimeo: 'Ver en Vimeo',
    play: 'Reproducir',
    pause: 'Pausar',
    mute: 'Silenciar',
    unmute: 'Activar sonido',
    volume: 'Control de volumen'
  };

  // Extraer ID de video de Vimeo de la URL (con soporte para hash de privacidad)
  const getVimeoVideoId = (url) => {
    if (!url) return null;

    // Si tiene formato ID?h=hash, devolver tal cual
    if (/^\d+\?h=[\w]+$/.test(url)) {
      return url;
    }

    // Si ya es un ID directo (número)
    if (/^\d+$/.test(url)) {
      return url;
    }

    // Patrones para URLs de Vimeo con hash al final
    // Formato: https://vimeo.com/1110101964/925233ecd4
    const hashPattern = /vimeo\.com\/(\d+)\/([a-zA-Z0-9]+)/;
    const hashMatch = url.match(hashPattern);
    if (hashMatch) {
      return `${hashMatch[1]}?h=${hashMatch[2]}`;
    }

    // Otros patrones comunes de URLs de Vimeo
    const patterns = [
      /vimeo\.com\/(\d+)(?:\?h=([\w]+))?/,
      /player\.vimeo\.com\/video\/(\d+)(?:\?h=([\w]+))?/,
      /vimeo\.com\/channels\/[\w]+\/(\d+)/,
      /vimeo\.com\/groups\/[\w]+\/videos\/(\d+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        // Si hay hash, incluirlo
        if (match[2]) {
          return `${match[1]}?h=${match[2]}`;
        }
        return match[1];
      }
    }

    return null;
  };

  // Cargar Vimeo Player SDK
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;

    // Verificar si ya está cargado
    if (window.Vimeo) {
      setVimeoSDKReady(true);
      return;
    }

    // Cargar el script de Vimeo Player si no está cargado
    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.async = true;
    script.onload = () => {
      setVimeoSDKReady(true);
    };
    script.onerror = () => {
      console.error('Error loading Vimeo SDK');
      setError(true);
      setIsLoading(false);
    };
    document.body.appendChild(script);
  }, []);

  // Crear/actualizar player cuando cambia el video o cuando el SDK está listo
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;

    // Si no hay video URL, limpiar y salir
    if (!videoUrl) {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.pause();
          playerInstanceRef.current.destroy();
        } catch (err) {
          console.error('Error destroying player:', err);
        }
        playerInstanceRef.current = null;
        setPlayer(null);
      }
      return;
    }

    // Esperar a que Vimeo SDK esté cargado
    if (!vimeoSDKReady || !window.Vimeo) {
      return;
    }

    const videoId = getVimeoVideoId(videoUrl);

    if (!videoId) {
      setError(true);
      setIsLoading(false);
      return;
    }

    setError(false);
    setIsReady(false);
    setIsLoading(true);
    setCurrentTime(0);

    // Destruir player existente antes de crear uno nuevo
    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.pause(); // Pausar primero
        playerInstanceRef.current.destroy();
      } catch (err) {
        console.error('Error destroying previous player:', err);
      }
      playerInstanceRef.current = null;
      setPlayer(null);
    }

    // Crear contenedor para el player
    const container = playerRef.current;
    if (!container) return;

    // Limpiar el contenedor
    container.innerHTML = '';

    // Crear iframe de Vimeo
    const iframe = document.createElement('div');
    iframe.id = `vimeo-player-${Date.now()}`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    container.appendChild(iframe);

    // Crear nuevo player con opciones personalizadas
    try {
      // Separar ID y hash si existe
      let vimeoId = videoId;
      let vimeoHash = null;

      if (videoId.includes('?h=')) {
        const parts = videoId.split('?h=');
        vimeoId = parts[0];
        vimeoHash = parts[1];
      }

      const options = {
        id: vimeoId,
        h: vimeoHash, // Incluir hash si existe
        width: '100%',
        height: '100%',
        responsive: true,
        autopause: false,
        autoplay: false,
        background: false,
        byline: false,
        color: '0072c0', // SM-blue
        controls: false, // Desactivar controles nativos
        dnt: true, // Do not track
        keyboard: false,
        loop: false,
        muted: false,
        pip: false,
        playsinline: true,
        portrait: false,
        quality: 'auto',
        speed: false,
        title: false,
        transparent: false
      };

      const newPlayer = new window.Vimeo.Player(iframe, options);

      // Configurar eventos
      newPlayer.on('loaded', () => {
        setIsLoading(false);
        setIsReady(true);

        // Obtener duración
        newPlayer.getDuration().then(d => {
          setDuration(d);
        });

        // Configurar volumen inicial
        newPlayer.setVolume(volume / 100);
      });

      newPlayer.on('ended', () => {
        setIsPlaying(false);
        if (onVideoEnd) {
          onVideoEnd();
        }
      });

      newPlayer.on('timeupdate', (data) => {
        setCurrentTime(data.seconds);
      });

      newPlayer.on('error', (error) => {
        console.error('Error en Vimeo Player:', error);
        setError(true);
        setIsLoading(false);
      });

      // Guardar en ref Y en estado
      playerInstanceRef.current = newPlayer;
      setPlayer(newPlayer);
    } catch (error) {
      console.error('Error creando Vimeo Player:', error);
      setError(true);
      setIsLoading(false);
    }

    // Cleanup: Destruir el player cuando el componente se desmonte o cambie la URL
    return () => {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.pause();
          playerInstanceRef.current.destroy();
        } catch (err) {
          console.error('Error cleaning up player:', err);
        }
        playerInstanceRef.current = null;
      }
    };
  }, [videoUrl, vimeoSDKReady]);

  // Control de reproducción
  useEffect(() => {
    if (!player || !isReady) return;

    if (isPlaying) {
      player.play().catch(error => {
        console.error('Error al reproducir:', error);
      });
    } else {
      player.pause().catch(error => {
        console.error('Error al pausar:', error);
      });
    }
  }, [isPlaying, player, isReady]);

  // Control de volumen
  useEffect(() => {
    if (player && isReady) {
      if (isMuted) {
        player.setVolume(0);
      } else {
        player.setVolume(volume / 100);
      }
    }
  }, [volume, isMuted, player, isReady]);

  // Funciones de control
  const handleSeek = (e) => {
    if (!player || !isReady) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    player.setCurrentTime(newTime);
    setCurrentTime(newTime);

    // Mantener controles visibles después de hacer seek
    if (isFullscreen) {
      showControlsTemporarily();
    }
  };

  // Handler para botón play/pause con controles
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);

    // Mantener controles visibles después de interacción
    if (isFullscreen) {
      showControlsTemporarily();
    }
  };

  // Handler para cambio de volumen
  const handleVolumeChange = (e) => {
    setVolume(Number(e.target.value));
    setIsMuted(false);

    // Mantener controles visibles durante ajuste
    if (isFullscreen) {
      showControlsTemporarily();
    }
  };

  // Handler para mute/unmute
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);

    // Mantener controles visibles después de interacción
    if (isFullscreen) {
      showControlsTemporarily();
    }
  };

  // Formatear tiempo
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Función para mostrar controles y reiniciar temporizador
  const showControlsTemporarily = () => {
    // Solo aplicar en fullscreen
    if (!isFullscreen) return;

    setShowControls(true);

    // Limpiar temporizador anterior
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }

    // Ocultar controles después de 3 segundos de inactividad
    // Solo ocultar si el video está reproduciéndose
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Mantener controles visibles cuando el video está pausado
  useEffect(() => {
    if (!isFullscreen) return;

    if (!isPlaying) {
      // Si está pausado, mostrar controles y limpiar temporizador
      setShowControls(true);
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    } else {
      // Si empieza a reproducir, iniciar temporizador
      showControlsTemporarily();
    }
  }, [isPlaying, isFullscreen]);

  // Efecto para manejar la visibilidad de controles en fullscreen
  useEffect(() => {
    if (!isFullscreen) {
      // En modo normal, siempre mostrar controles
      setShowControls(true);
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      return;
    }

    // En fullscreen, mostrar controles inicialmente
    showControlsTemporarily();

    // Cleanup
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, [isFullscreen]);

  // Efecto para agregar listeners de interacción en fullscreen
  useEffect(() => {
    if (!isFullscreen || !videoContainerRef.current) return;

    const container = videoContainerRef.current;
    let touchStartTime = 0;

    // Handler para click
    const handleClick = (e) => {
      // Si el click fue en los controles, no hacer nada (dejar que funcionen)
      if (e.target.closest('.video-controls')) {
        return;
      }

      // Mostrar controles temporalmente
      showControlsTemporarily();
    };

    // Handler para touch start (guardar tiempo)
    const handleTouchStart = (e) => {
      touchStartTime = Date.now();
    };

    // Handler para touch end
    const handleTouchEnd = (e) => {
      // Si el touch fue en los controles, no hacer nada
      if (e.target.closest('.video-controls')) {
        return;
      }

      // Verificar que fue un tap (no un swipe)
      const touchDuration = Date.now() - touchStartTime;
      if (touchDuration < 500) {
        // Prevenir que también se dispare el evento click
        e.preventDefault();

        // Mostrar controles temporalmente
        showControlsTemporarily();
      }
    };

    // Agregar listeners
    container.addEventListener('click', handleClick);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('mousemove', showControlsTemporarily);

    // Cleanup
    return () => {
      container.removeEventListener('click', handleClick);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('mousemove', showControlsTemporarily);
    };
  }, [isFullscreen]);

  return (
    <div className={`${isFullscreen ? 'w-full h-full flex flex-col' : 'w-full'}`}>
      {/* Video container */}
      <div
        ref={videoContainerRef}
        className={`${isFullscreen ? 'flex-1 relative flex items-center justify-center' : 'relative w-full'} bg-black`}
        style={{
          paddingBottom: isFullscreen ? undefined : '56.25%',
          cursor: isFullscreen && !showControls ? 'none' : 'default',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation'
        }}
      >
        <div className={`${isFullscreen ? 'relative w-full h-full max-w-full max-h-full' : 'absolute inset-0'} flex items-center justify-center`}>
          {error ? (
            <div className="flex items-center justify-center h-full bg-slate-900">
              <div className="text-center p-6">
                <p className="text-white mb-4">{t.error}</p>
                {videoUrl && (
                  <a
                    href={`https://vimeo.com/${getVimeoVideoId(videoUrl)?.split('?')[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span>{t.viewOnVimeo}</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                    <p className="text-white">{t.loading}</p>
                  </div>
                </div>
              )}
              <div
                ref={playerRef}
                className={`vimeo-container ${isFullscreen ? 'fullscreen-video' : ''} w-full h-full relative`}
                style={{
                  pointerEvents: isFullscreen ? 'none' : 'auto'
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Controles - ajustados para fullscreen */}
      {!error && !isLoading && (
        <div
          className={`video-controls transition-all duration-300 ${
            isFullscreen
              ? `absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-6 py-4 ${
                  showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`
              : 'w-full p-6'
          }`}
        >
          {/* Barra de progreso */}
          <div className="mb-4">
            <div className={`flex items-center justify-between text-sm mb-2 ${isFullscreen ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div
              className={`h-2 rounded-full cursor-pointer relative ${isFullscreen ? 'bg-white/30' : 'bg-slate-200 dark:bg-slate-700'}`}
              onClick={handleSeek}
            >
              <div
                className={`h-full rounded-full transition-all duration-100 ${isFullscreen ? 'bg-blue-500' : 'bg-blue-600'}`}
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center justify-between">
            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              disabled={!isReady || isLoading}
              className={`p-3 rounded-full transition-colors ${
                isFullscreen
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
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
            <div className={`flex items-center space-x-3 rounded-lg px-4 py-2 ${
              isFullscreen ? 'bg-white/10' : 'bg-slate-100 dark:bg-slate-700'
            }`}>
              <button
                onClick={handleMuteToggle}
                className={`transition-colors ${
                  isFullscreen
                    ? 'text-white hover:text-gray-300'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                aria-label={isMuted ? t.unmute : t.mute}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  {isMuted ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          clipRule="evenodd"/>
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                  )}
                </svg>
              </button>

              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className={`w-24 h-1 rounded-lg appearance-none cursor-pointer vimeo-slider ${
                  isFullscreen ? 'bg-white/30' : 'bg-slate-300 dark:bg-slate-600'
                }`}
                aria-label={t.volume}
              />

              <span className={`text-sm w-10 text-right ${
                isFullscreen ? 'text-white' : 'text-slate-600 dark:text-slate-400'
              }`}>
                {isMuted ? '0' : volume}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS para el slider de volumen y Vimeo iframe */}
      <style dangerouslySetInnerHTML={{ __html: `
        .vimeo-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(to right, #0072c0, #0099ff);
          cursor: pointer;
        }

        .vimeo-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(to right, #0072c0, #0099ff);
          cursor: pointer;
          border: none;
        }

        /* Estilos para el contenedor del vídeo en modo normal */
        ${!isFullscreen ? `
          .vimeo-container {
            width: 100% !important;
            height: 100% !important;
            position: relative !important;
          }

          .vimeo-container iframe,
          .vimeo-container > div {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }
        ` : `
          /* Estilos para fullscreen - mantener aspect ratio 16:9 */
          .vimeo-container {
            width: 100% !important;
            height: 100% !important;
            max-width: calc(100vh * 16 / 9) !important;
            max-height: calc(100vw * 9 / 16) !important;
            position: relative !important;
            margin: 0 auto !important;
          }

          .vimeo-container iframe,
          .vimeo-container > div {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 100% !important;
            height: 100% !important;
          }
        `}
      `}} />
    </div>
  );
};

export default VimeoPlayerSimple;
