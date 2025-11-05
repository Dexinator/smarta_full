import { useEffect, useRef } from 'react';

/**
 * LiveRegion Component
 *
 * Accessible component for announcing dynamic content changes to screen readers.
 * Uses ARIA live regions to provide real-time updates without disrupting user flow.
 *
 * @param {string} message - The message to announce to screen readers
 * @param {string} politeness - Announcement urgency: 'polite' (default) or 'assertive'
 * @param {boolean} atomic - Whether to read the entire region (true) or just changes (false)
 * @param {string} role - ARIA role for the region, defaults to 'status'
 *
 * Usage examples:
 *
 * // Announce slide changes in a gallery
 * <LiveRegion
 *   message={`Imagen ${currentIndex + 1} de ${totalImages}: ${images[currentIndex].alt}`}
 *   politeness="polite"
 *   atomic={true}
 * />
 *
 * // Announce critical errors
 * <LiveRegion
 *   message="Error: No se pudo cargar el video"
 *   politeness="assertive"
 *   atomic={true}
 *   role="alert"
 * />
 */
export default function LiveRegion({
  message,
  politeness = 'polite',
  atomic = true,
  role = 'status'
}) {
  const previousMessage = useRef('');

  useEffect(() => {
    // Update the previous message ref after each render
    previousMessage.current = message;
  }, [message]);

  // Only render if there's a message and it's different from the previous one
  const shouldRender = message && message !== previousMessage.current;

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      role={role}
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {message}
    </div>
  );
}
