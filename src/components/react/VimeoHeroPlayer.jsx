import { useState, useEffect, useRef } from 'react';

const VimeoHeroPlayer = ({
  vimeoId,
  className = ''
}) => {
  const [player, setPlayer] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [vimeoSDKReady, setVimeoSDKReady] = useState(false);

  const containerRef = useRef(null);
  const playerRef = useRef(null);

  // Detectar cambios en pantalla completa y dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Extraer ID de video de Vimeo de la URL
  const getVimeoVideoId = (url) => {
    if (!url) return null;

    if (/^\d+\?h=[\w]+$/.test(url)) {
      return url;
    }

    if (/^\d+$/.test(url)) {
      return url;
    }

    const hashPattern = /vimeo\.com\/(\d+)\/([a-zA-Z0-9]+)/;
    const hashMatch = url.match(hashPattern);
    if (hashMatch) {
      return `${hashMatch[1]}?h=${hashMatch[2]}`;
    }

    const patterns = [
      /vimeo\.com\/(\d+)(?:\?h=([\w]+))?/,
      /player\.vimeo\.com\/video\/(\d+)(?:\?h=([\w]+))?/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
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
    if (typeof window === 'undefined') return;

    if (window.Vimeo) {
      setVimeoSDKReady(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="player.vimeo.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setVimeoSDKReady(true));
      if (window.Vimeo) {
        setVimeoSDKReady(true);
      }
      return;
    }

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

  // Crear/actualizar player
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!vimeoSDKReady || !window.Vimeo) {
      return;
    }

    const videoId = getVimeoVideoId(vimeoId);

    if (!videoId) {
      setError(true);
      setIsLoading(false);
      return;
    }

    setError(false);
    setIsReady(false);
    setIsLoading(true);
    setCurrentTime(0);

    if (player) {
      player.destroy();
      setPlayer(null);
    }

    const container = playerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const iframe = document.createElement('div');
    iframe.id = `vimeo-hero-player-${videoId}`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    container.appendChild(iframe);

    try {
      let vimeoVideoId = videoId;
      let vimeoHash = null;

      if (videoId.includes('?h=')) {
        const parts = videoId.split('?h=');
        vimeoVideoId = parts[0];
        vimeoHash = parts[1];
      }

      const options = {
        id: vimeoVideoId,
        h: vimeoHash,
        width: '100%',
        height: '100%',
        responsive: true,
        autopause: false,
        autoplay: true, // Autoplay activado
        background: false,
        byline: false,
        color: '0072c0',
        controls: false, // Sin controles nativos
        dnt: true,
        keyboard: false,
        loop: true, // Loop activado
        muted: false, // CON sonido
        pip: false,
        playsinline: true,
        portrait: false,
        quality: 'auto',
        speed: false,
        title: false,
        transparent: false
      };

      const newPlayer = new window.Vimeo.Player(iframe, options);

      newPlayer.on('loaded', () => {
        setIsLoading(false);
        setIsReady(true);

        newPlayer.getDuration().then(d => {
          setDuration(d);
        });

        newPlayer.setVolume(volume / 100);
      });

      newPlayer.on('play', () => {
        setIsPlaying(true);
      });

      newPlayer.on('pause', () => {
        setIsPlaying(false);
      });

      newPlayer.on('ended', () => {
        // Con loop=true no debería llegar aquí
        setIsPlaying(false);
      });

      newPlayer.on('timeupdate', (data) => {
        setCurrentTime(data.seconds);
      });

      newPlayer.on('error', (error) => {
        console.error('Error en Vimeo Player:', error);
        setError(true);
        setIsLoading(false);
      });

      setPlayer(newPlayer);
    } catch (error) {
      console.error('Error creando Vimeo Player:', error);
      setError(true);
      setIsLoading(false);
    }
  }, [vimeoId, vimeoSDKReady]);

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
  const handlePlayPause = () => {
    if (!player || !isReady) return;

    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleSeek = (e) => {
    if (!player || !isReady) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    player.setCurrentTime(newTime);
    setCurrentTime(newTime);
  };

  const toggleFullscreen = async () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();

        if ('orientation' in screen && screen.orientation.lock) {
          try {
            await screen.orientation.lock('landscape');
          } catch (err) {
            // Silenciar
          }
        }
      } catch (err) {
        console.error('Error al entrar en pantalla completa:', err);
      }
    } else {
      try {
        await document.exitFullscreen();

        if ('orientation' in screen && screen.orientation.unlock) {
          try {
            screen.orientation.unlock();
          } catch (err) {
            // Silenciar
          }
        }
      } catch (err) {
        console.error('Error al salir de pantalla completa:', err);
      }
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-slate-900 ${className}`}>
        <div className="text-center p-6">
          <p className="text-white mb-4">Error al cargar el video</p>
          {vimeoId && (
            <a
              href={`https://vimeo.com/${getVimeoVideoId(vimeoId)?.split('?')[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Ver en Vimeo</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-slate-900 ${className} ${
        isFullscreen ? 'fixed inset-0 z-[100] rounded-none bg-black' : ''
      }`}
    >
      {/* Video container */}
      <div className={`relative ${isFullscreen ? 'w-full h-full' : 'w-full h-full'}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-SM-blue border-t-transparent mb-4 mx-auto"></div>
              <p className="text-white">Cargando video...</p>
            </div>
          </div>
        )}

        <div ref={playerRef} className="vimeo-hero-container absolute inset-0 w-full h-full" />

        {/* Controles flotantes (solo cuando NO está en fullscreen) */}
        {!isFullscreen && isReady && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-30">
            {/* Barra de progreso */}
            <div
              className="h-1 bg-white/30 rounded-full cursor-pointer mb-3 relative"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-SM-blue rounded-full transition-all duration-100"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              {/* Play/Pause */}
              <button
                onClick={handlePlayPause}
                className="p-2 text-white hover:text-SM-yellow transition-colors"
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isPlaying ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6"/>
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  )}
                </svg>
              </button>

              {/* Tiempo */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Controles derecha */}
              <div className="flex items-center space-x-2">
                {/* Volumen */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 text-white hover:text-SM-yellow transition-colors"
                  aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMuted ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"/>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                    )}
                  </svg>
                </button>

                {/* Pantalla completa */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-white hover:text-SM-yellow transition-colors"
                  aria-label="Pantalla completa"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controles en pantalla completa */}
        {isFullscreen && isReady && (
          <>
            {/* Botón salir de pantalla completa */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-40 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-2xl transition-all"
              aria-label="Salir de pantalla completa"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            {/* Controles en pantalla completa */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 z-30">
              <div
                className="h-2 bg-white/30 rounded-full cursor-pointer mb-4 relative"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-SM-blue rounded-full transition-all duration-100"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handlePlayPause}
                  className="p-3 text-white hover:text-SM-yellow transition-colors"
                  aria-label={isPlaying ? "Pausar" : "Reproducir"}
                >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isPlaying ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6"/>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    )}
                  </svg>
                </button>

                <span className="text-white text-lg">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-3 text-white hover:text-SM-yellow transition-colors"
                  aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMuted ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"/>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Estilos CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .vimeo-hero-container {
          width: 100% !important;
          height: 100% !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
        }

        .vimeo-hero-container iframe,
        .vimeo-hero-container > div {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }

        /* Optimizado para video vertical 9:16 */
        @media (max-width: 768px) and (orientation: portrait) {
          .vimeo-hero-container iframe,
          .vimeo-hero-container > div {
            object-fit: cover !important;
          }
        }

        /* En desktop/landscape, centrar el video */
        @media (min-width: 769px), (orientation: landscape) {
          .vimeo-hero-container iframe,
          .vimeo-hero-container > div {
            object-fit: contain !important;
          }
        }
      `}} />
    </div>
  );
};

export default VimeoHeroPlayer;
