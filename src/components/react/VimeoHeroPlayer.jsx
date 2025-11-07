import { useState, useEffect, useRef } from 'react';
import LiveRegion from '../ui/LiveRegion';

const VimeoHeroPlayer = ({
  vimeoId,
  className = '',
  language = 'es'
}) => {
  const [player, setPlayer] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(true); // Iniciar muted para permitir autoplay
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [vimeoSDKReady, setVimeoSDKReady] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const [showFullscreenControls, setShowFullscreenControls] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(true);

  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const hideControlsTimer = useRef(null);

  // Textos de accesibilidad bilingües
  const ariaTexts = {
    es: {
      play: 'Reproducir video',
      pause: 'Pausar video',
      mute: 'Silenciar video',
      unmute: 'Activar sonido del video',
      fullscreen: 'Ver en pantalla completa',
      exitFullscreen: 'Salir de pantalla completa',
      loading: 'Cargando video...',
      error: 'Error al cargar el video',
      ended: 'El video ha terminado',
      progress: 'Barra de progreso del video',
      currentTime: (current, total) => `${current} de ${total}`,
      volume: 'Control de volumen',
      volumeLevel: (level) => `Volumen al ${level} por ciento`
    },
    en: {
      play: 'Play video',
      pause: 'Pause video',
      mute: 'Mute video',
      unmute: 'Unmute video',
      fullscreen: 'View fullscreen',
      exitFullscreen: 'Exit fullscreen',
      loading: 'Loading video...',
      error: 'Error loading video',
      ended: 'Video has ended',
      progress: 'Video progress bar',
      currentTime: (current, total) => `${current} of ${total}`,
      volume: 'Volume control',
      volumeLevel: (level) => `Volume at ${level} percent`
    }
  };

  const t = ariaTexts[language] || ariaTexts.es;

  // Detectar cambios en pantalla completa y dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(userAgent);
      const isIOSDevice = /iPhone|iPad|iPod/i.test(userAgent) && !window.MSStream;

      setIsMobile(isMobileDevice);
      setIsIOS(isIOSDevice);

      // Verificar soporte de fullscreen
      const doc = document;
      const hasFullscreenSupport = !!(
        doc.fullscreenEnabled ||
        doc.webkitFullscreenEnabled ||
        doc.mozFullScreenEnabled ||
        doc.msFullscreenEnabled
      );
      setFullscreenSupported(hasFullscreenSupport);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleFullscreenChange = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      setIsFullscreen(!!fullscreenElement);
    };

    // Agregar listeners para todos los prefijos de navegador
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
        muted: true, // SIN sonido inicialmente para permitir autoplay en móviles
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

        // Iniciar con volumen 0 (muted) para cumplir políticas de autoplay
        newPlayer.setVolume(0);
      });

      newPlayer.on('play', () => {
        setIsPlaying(true);
        setLiveMessage(t.play);
      });

      newPlayer.on('pause', () => {
        setIsPlaying(false);
        setLiveMessage(t.pause);
      });

      newPlayer.on('ended', () => {
        // Con loop=true no debería llegar aquí
        setIsPlaying(false);
        setLiveMessage(t.ended);
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

  // Auto-ocultar controles en pantalla completa
  useEffect(() => {
    if (isFullscreen) {
      // Mostrar controles inicialmente
      setShowFullscreenControls(true);

      // Configurar temporizador para ocultar después de 3 segundos
      hideControlsTimer.current = setTimeout(() => {
        setShowFullscreenControls(false);
      }, 3000);
    } else {
      // Limpiar temporizador si salimos de pantalla completa
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
        hideControlsTimer.current = null;
      }
      setShowFullscreenControls(true);
    }

    // Limpiar temporizador al desmontar
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, [isFullscreen]);

  // Manejar interacción (mouse o touch) en pantalla completa
  const handleShowControls = () => {
    if (!isFullscreen) return;

    // Mostrar controles
    setShowFullscreenControls(true);

    // Limpiar temporizador existente
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }

    // Configurar nuevo temporizador
    hideControlsTimer.current = setTimeout(() => {
      setShowFullscreenControls(false);
    }, 3000);
  };

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

  // Verificar soporte de fullscreen API
  const checkFullscreenSupport = () => {
    const doc = document;
    return !!(
      doc.fullscreenEnabled ||
      doc.webkitFullscreenEnabled ||
      doc.mozFullScreenEnabled ||
      doc.msFullscreenEnabled
    );
  };

  // Obtener el elemento en fullscreen actual
  const getFullscreenElement = () => {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  };

  // Solicitar fullscreen con compatibilidad cross-browser
  const requestFullscreen = async (element) => {
    if (element.requestFullscreen) {
      return element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      // Safari/iOS
      return element.webkitRequestFullscreen();
    } else if (element.webkitEnterFullscreen) {
      // iOS Safari para elementos de video
      return element.webkitEnterFullscreen();
    } else if (element.mozRequestFullScreen) {
      // Firefox
      return element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      // IE/Edge
      return element.msRequestFullscreen();
    }
    throw new Error('Fullscreen API no soportada');
  };

  // Salir de fullscreen con compatibilidad cross-browser
  const exitFullscreen = async () => {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      // Safari
      return document.webkitExitFullscreen();
    } else if (document.webkitCancelFullScreen) {
      // Safari alternativo
      return document.webkitCancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      // Firefox
      return document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      // IE/Edge
      return document.msExitFullscreen();
    }
  };

  const toggleFullscreen = async () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    if (!containerRef.current) return;

    // Verificar soporte de fullscreen
    if (!checkFullscreenSupport()) {
      // Fallback 1: Intentar usar el método nativo de Vimeo Player
      if (player && player.requestFullscreen) {
        try {
          player.requestFullscreen();
          return;
        } catch (err) {
          console.warn('No se pudo usar fullscreen nativo de Vimeo:', err);
        }
      }

      // Fallback 2: iOS Safari - intentar fullscreen en el iframe del video
      if (playerRef.current) {
        const iframe = playerRef.current.querySelector('iframe');
        if (iframe) {
          // Intentar método webkit específico para videos
          if (iframe.webkitEnterFullscreen) {
            try {
              iframe.webkitEnterFullscreen();
              return;
            } catch (err) {
              console.warn('No se pudo activar fullscreen webkit en iOS:', err);
            }
          }
          // Intentar webkitRequestFullscreen
          if (iframe.webkitRequestFullscreen) {
            try {
              iframe.webkitRequestFullscreen();
              return;
            } catch (err) {
              console.warn('No se pudo activar webkitRequestFullscreen:', err);
            }
          }
        }
      }

      // Si es iOS, abrir en Vimeo directamente
      if (isIOS) {
        const videoId = getVimeoVideoId(vimeoId)?.split('?')[0];
        if (videoId) {
          window.open(`https://vimeo.com/${videoId}`, '_blank');
          setLiveMessage(language === 'es'
            ? 'Abriendo video en Vimeo'
            : 'Opening video in Vimeo');
          return;
        }
      }

      // Si no hay soporte, mostrar mensaje
      console.warn('Fullscreen API no soportada en este dispositivo');
      setLiveMessage(language === 'es'
        ? 'Pantalla completa no disponible en este navegador'
        : 'Fullscreen not available in this browser');
      return;
    }

    const isCurrentlyFullscreen = getFullscreenElement();

    if (!isCurrentlyFullscreen) {
      try {
        await requestFullscreen(containerRef.current);

        // NO forzar orientación - permitir que el usuario decida
        // Los videos verticales (9:16) se ven mejor en portrait
        // Los usuarios pueden rotar su dispositivo si lo desean
      } catch (err) {
        // Fallback: intentar con el iframe directamente
        if (playerRef.current) {
          const iframe = playerRef.current.querySelector('iframe');
          if (iframe) {
            try {
              await requestFullscreen(iframe);
            } catch (fallbackErr) {
              console.error('Error al entrar en pantalla completa:', fallbackErr);
              setLiveMessage(language === 'es'
                ? 'Error al activar pantalla completa'
                : 'Error entering fullscreen');
            }
          }
        }
      }
    } else {
      try {
        await exitFullscreen();
        // No es necesario desbloquear orientación ya que no la bloqueamos
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
      <div className={`w-full h-full flex items-center justify-center bg-slate-900 ${className}`} role="alert" aria-live="assertive">
        <div className="text-center p-6">
          <p className="text-white mb-4">{t.error}</p>
          {vimeoId && (
            <a
              href={`https://vimeo.com/${getVimeoVideoId(vimeoId)?.split('?')[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${language === 'es' ? 'Ver en Vimeo (se abre en nueva pestaña)' : 'View on Vimeo (opens in new tab)'}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>{language === 'es' ? 'Ver en Vimeo' : 'View on Vimeo'}</span>
              <svg aria-hidden="true" className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      onMouseMove={handleShowControls}
      onTouchStart={handleShowControls}
      onClick={handleShowControls}
    >
      {/* Video container */}
      <div className={`relative ${isFullscreen ? 'w-full h-full' : 'w-full h-full'}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-end justify-center pb-20 bg-slate-900 z-20" role="status" aria-live="polite">
            <div className="text-center">
              <div aria-hidden="true" className="animate-spin rounded-full h-12 w-12 border-4 border-SM-blue border-t-transparent mb-4 mx-auto"></div>
              <p className="text-white">{t.loading}</p>
            </div>
          </div>
        )}

        <div ref={playerRef} className="vimeo-hero-container absolute inset-0 w-full h-full" aria-label={language === 'es' ? 'Reproductor de video' : 'Video player'}>
          {/* Overlay transparente para capturar clics sobre el video en fullscreen */}
          {isFullscreen && (
            <div
              className="absolute inset-0 z-20 cursor-pointer"
              onClick={handleShowControls}
              onTouchStart={handleShowControls}
              style={{ backgroundColor: 'transparent' }}
              aria-hidden="true"
            />
          )}

          {/* Barra de controles sobre el video (solo cuando NO está en fullscreen) */}
          {!isFullscreen && isReady && (
            <div className="video-controls-overlay">
              <div className="flex items-center justify-center gap-3 md:gap-4" role="group" aria-label={language === 'es' ? 'Controles de video' : 'Video controls'}>
                {/* Play/Pause */}
                <button
                  onClick={handlePlayPause}
                  className="p-2 text-white hover:text-SM-yellow transition-colors flex-shrink-0"
                  aria-label={isPlaying ? t.pause : t.play}
                >
                  <svg aria-hidden="true" className="w-8 h-8 md:w-9 md:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isPlaying ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6"/>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    )}
                  </svg>
                </button>

                {/* Volumen */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2 text-white hover:text-SM-yellow transition-colors flex-shrink-0 relative ${isMuted ? 'animate-pulse' : ''}`}
                  aria-label={isMuted ? t.unmute : t.mute}
                  aria-pressed={!isMuted}
                >
                  {isMuted && (
                    <span aria-hidden="true" className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-SM-yellow opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-SM-yellow"></span>
                    </span>
                  )}
                  <svg aria-hidden="true" className="w-8 h-8 md:w-9 md:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMuted ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"/>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                    )}
                  </svg>
                </button>

                {/* Pantalla completa */}
                {isIOS && !fullscreenSupported ? (
                  // Botón alternativo para iOS
                  <a
                    href={`https://vimeo.com/${getVimeoVideoId(vimeoId)?.split('?')[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-white hover:text-SM-yellow transition-colors flex-shrink-0 relative"
                    aria-label={language === 'es' ? 'Ver video en Vimeo (se abre en nueva pestaña)' : 'View video on Vimeo (opens in new tab)'}
                  >
                    <svg aria-hidden="true" className="w-8 h-8 md:w-9 md:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {/* Indicador visual de enlace externo */}
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-SM-yellow rounded-full animate-pulse" aria-hidden="true"></span>
                  </a>
                ) : (
                  // Botón estándar de fullscreen
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 text-white hover:text-SM-yellow transition-colors flex-shrink-0"
                    aria-label={t.fullscreen}
                  >
                    <svg aria-hidden="true" className="w-8 h-8 md:w-9 md:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controles en pantalla completa */}
        {isFullscreen && isReady && showFullscreenControls && (
          <>
            {/* Botón salir de pantalla completa */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-40 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-2xl transition-all"
              aria-label={t.exitFullscreen}
            >
              <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            {/* Controles en pantalla completa */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 z-30">
              <div
                role="slider"
                aria-label={t.progress}
                aria-valuemin={0}
                aria-valuemax={duration}
                aria-valuenow={currentTime}
                aria-valuetext={t.currentTime(formatTime(currentTime), formatTime(duration))}
                tabIndex={0}
                className="h-2 bg-white/30 rounded-full cursor-pointer mb-4 relative"
                onClick={handleSeek}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') {
                    const newTime = Math.max(0, currentTime - 5);
                    player?.setCurrentTime(newTime);
                  } else if (e.key === 'ArrowRight') {
                    const newTime = Math.min(duration, currentTime + 5);
                    player?.setCurrentTime(newTime);
                  }
                }}
              >
                <div
                  className="h-full bg-SM-blue rounded-full transition-all duration-100"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between" role="group" aria-label={language === 'es' ? 'Controles de video en pantalla completa' : 'Fullscreen video controls'}>
                <button
                  onClick={handlePlayPause}
                  className="p-3 text-white hover:text-SM-yellow transition-colors"
                  aria-label={isPlaying ? t.pause : t.play}
                >
                  <svg aria-hidden="true" className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isPlaying ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6"/>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    )}
                  </svg>
                </button>

                <span className="text-white text-lg" aria-live="off">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-3 text-white hover:text-SM-yellow transition-colors"
                  aria-label={isMuted ? t.unmute : t.mute}
                  aria-pressed={!isMuted}
                >
                  <svg aria-hidden="true" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <LiveRegion
        message={liveMessage}
        politeness="polite"
        atomic={true}
      />

      {/* Estilos CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .vimeo-hero-container {
          width: 100% !important;
          height: 100% !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        /* Contenedor para mantener aspect ratio 9:16 (vertical)
           NOTA: Los videos son verticales (formato móvil/reel)
           Por eso NO forzamos orientación horizontal en fullscreen
           El usuario puede rotar su dispositivo si lo desea */
        .vimeo-hero-container > div:first-child {
          position: relative !important;
          width: auto !important;
          height: 100% !important;
          aspect-ratio: 9 / 16 !important;
          max-width: 100% !important;
        }

        .vimeo-hero-container iframe {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }

        /* Controles de video sobre el video - mismo tamaño y posicionamiento que el vídeo */
        .video-controls-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: auto;
          height: 100%;
          aspect-ratio: 9 / 16;
          max-width: 100%;
          z-index: 45;
          pointer-events: none;
          display: flex;
          justify-content: center;
          align-items: flex-end;
        }

        .video-controls-overlay > div {
          pointer-events: all;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
          padding: 1rem;
          width: 100%;
        }

        /* En desktop: arriba a la derecha del vídeo, sin gradiente, fondo transparente */
        @media (min-width: 768px) {
          .video-controls-overlay {
            justify-content: flex-end;
            align-items: flex-start;
          }

          .video-controls-overlay > div {
            margin: 1rem;
            background: transparent;
            width: auto;
            padding: 0.5rem;
          }
        }

        /* En pantallas muy anchas */
        @media (min-aspect-ratio: 9/16) {
          .video-controls-overlay {
            height: 100%;
            width: auto;
          }
        }

        /* En pantallas verticales (móviles) */
        @media (max-aspect-ratio: 9/16) {
          .video-controls-overlay {
            width: 100%;
            height: auto;
          }
        }

        /* En pantallas muy anchas, limitar el ancho basado en la altura */
        @media (min-aspect-ratio: 9/16) {
          .vimeo-hero-container > div:first-child {
            height: 100% !important;
            width: auto !important;
          }
        }

        /* En pantallas verticales (móviles), limitar la altura basada en el ancho */
        @media (max-aspect-ratio: 9/16) {
          .vimeo-hero-container > div:first-child {
            width: 100% !important;
            height: auto !important;
          }
        }

        /* En fullscreen: eliminar restricciones y ocupar todo el espacio */
        .fixed.inset-0 .vimeo-hero-container > div:first-child {
          aspect-ratio: unset !important;
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
        }
      `}} />
    </div>
  );
};

export default VimeoHeroPlayer;
