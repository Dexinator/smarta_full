import { useEffect, useRef, useState } from 'react';

const MapComponent = ({
  center = [40.9505, -5.6300],
  zoom = 15,
  className = "",
  locations = [],
  showControls = true,
  language = 'es'
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollZoomEnabled, setScrollZoomEnabled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const content = {
    es: {
      title: "Ubicación",
      loading: "Cargando mapa...",
      error: "Error al cargar el mapa",
      tryAgain: "Intentar de nuevo",
      unlockMap: "🔓 Desbloquear mapa",
      lockMap: "🔒 Bloquear mapa",
      mapUnlockedTitle: "Mapa desbloqueado - puedes hacer zoom y mover el mapa",
      mapLockedTitle: "Mapa bloqueado - haz clic para interactuar",
      scrollLockMessage: "Haz clic en 'Desbloquear mapa' para interactuar",
      getDirections: "Cómo llegar"
    },
    en: {
      title: "Location",
      loading: "Loading map...",
      error: "Error loading map",
      tryAgain: "Try again",
      unlockMap: "🔓 Unlock map",
      lockMap: "🔒 Lock map",
      mapUnlockedTitle: "Map unlocked - you can zoom and move the map",
      mapLockedTitle: "Map locked - click to interact",
      scrollLockMessage: "Click 'Unlock map' to interact",
      getDirections: "Get directions"
    }
  };

  const t = content[language] || content.es;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleScrollZoom = () => {
    if (mapInstanceRef.current) {
      if (scrollZoomEnabled) {
        mapInstanceRef.current.scrollWheelZoom.disable();
        mapInstanceRef.current.dragging.disable();
        mapInstanceRef.current.touchZoom.disable();
      } else {
        mapInstanceRef.current.scrollWheelZoom.enable();
        mapInstanceRef.current.dragging.enable();
        mapInstanceRef.current.touchZoom.enable();
      }
      setScrollZoomEnabled(!scrollZoomEnabled);
    }
  };

  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        const L = await import('https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js');

        if (mapRef.current && !mapInstanceRef.current) {
          const map = L.map(mapRef.current, {
            scrollWheelZoom: false,
            dragging: false,
            touchZoom: false,
            doubleClickZoom: true,
            boxZoom: false,
            keyboard: false,
            zoomControl: showControls,
            attributionControl: false
          }).setView(center, zoom);

          L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
            attribution: '© CartoDB, © OpenStreetMap',
            maxZoom: 18,
            className: 'map-tiles-muted'
          }).addTo(map);

          const createCustomIcon = (isMain = false) => {
            return L.divIcon({
              className: 'custom-marker',
              html: `
                <div class="w-12 h-12 rounded-full border-3 border-white shadow-xl flex items-center justify-center text-white text-lg font-bold ${
                  isMain
                    ? 'bg-SM-yellow animate-pulse shadow-yellow-400/50'
                    : 'bg-SM-blue hover:bg-blue-700 shadow-blue-500/50'
                } transition-all duration-300 transform hover:scale-110">
                  <span aria-hidden="true">📍</span>
                </div>
              `,
              iconSize: [48, 48],
              iconAnchor: [24, 24],
              popupAnchor: [0, -24]
            });
          };

          locations.forEach((location, index) => {
            const marker = L.marker(location.coordinates, {
              icon: createCustomIcon(index === 0),
              alt: location.name
            }).addTo(map);

            if (location.name || location.description) {
              const popupContent = `
                <div class="p-3 min-w-48">
                  ${location.name ? `<h3 class="font-semibold text-SM-blue mb-1">${location.name}</h3>` : ''}
                  ${location.description ? `<p class="text-sm text-slate-600 mb-2">${location.description}</p>` : ''}
                  ${location.coordinates ? `
                    <a
                      href="https://maps.google.com/maps?daddr=${location.coordinates[0]},${location.coordinates[1]}"
                      target="_blank"
                      class="bg-SM-yellow text-SM-black px-3 py-1 rounded text-xs text-center hover:bg-yellow-500 transition-colors block"
                    >
                      📍 ${t.getDirections}
                    </a>
                  ` : ''}
                </div>
              `;

              marker.bindPopup(L.popup({
                maxWidth: 250,
                className: 'custom-popup',
                closeButton: true
              }).setContent(popupContent));
            }

            markersRef.current.push(marker);
          });

          if (locations.length > 1) {
            const group = new L.featureGroup(markersRef.current);
            map.fitBounds(group.getBounds().pad(0.1));
          }

          mapInstanceRef.current = map;
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading map:', err);
        setError(t.error);
        setIsLoading(false);
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, locations, language, showControls]);

  useEffect(() => {
    const styleId = 'map-component-styles';

    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .map-container .leaflet-container {
          position: relative !important;
          z-index: 1 !important;
        }
        .map-container .leaflet-tile {
          filter: grayscale(0.3) contrast(0.8) brightness(1.1) !important;
        }
        .map-tiles-muted {
          opacity: 0.7 !important;
        }
        .custom-marker {
          z-index: 10 !important;
        }
        .custom-marker div {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          padding: 0 !important;
          overflow: visible !important;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0 !important;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  if (error) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4" aria-hidden="true">⚠️</div>
          <h3 className="font-semibold text-lg mb-2">{t.error}</h3>
          <button
            onClick={() => window.location.reload()}
            className="bg-SM-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t.tryAgain}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
      {showControls && (
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-slate-100">
              {t.title}
            </h3>
            <button
              onClick={toggleScrollZoom}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                scrollZoomEnabled
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  : 'bg-SM-blue text-white hover:bg-blue-700 active:bg-blue-800'
              }`}
              title={scrollZoomEnabled ? t.mapUnlockedTitle : t.mapLockedTitle}
            >
              <span className="hidden sm:inline">{scrollZoomEnabled ? t.lockMap : t.unlockMap}</span>
              <span className="sm:hidden">{scrollZoomEnabled ? '🔒' : '🔓'}</span>
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-slate-100 dark:bg-slate-700 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-SM-blue border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t.loading}</p>
            </div>
          </div>
        )}
        <div
          ref={mapRef}
          className="h-48 sm:h-64 md:h-96 w-full map-container"
          style={{
            minHeight: '192px',
            position: 'relative',
            zIndex: 1
          }}
          role="application"
          aria-label={`${t.title} - ${t.scrollLockMessage}`}
        />
        {!scrollZoomEnabled && !isLoading && showControls && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <button
              onClick={toggleScrollZoom}
              className="pointer-events-auto bg-white dark:bg-slate-800 border-2 border-SM-blue px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-xl hover:shadow-2xl transform active:scale-95 sm:hover:scale-105 transition-all"
            >
              <span className="text-xl sm:text-2xl mr-1 sm:mr-2" aria-hidden="true">🔓</span>
              <span className="font-semibold text-sm sm:text-base text-SM-blue dark:text-SM-yellow">
                {t.unlockMap.replace('🔓 ', '')}
              </span>
            </button>
          </div>
        )}
      </div>

      {!scrollZoomEnabled && showControls && (
        <div className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-700/50">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            {t.scrollLockMessage}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;