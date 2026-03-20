import React, { useState } from "react";
import type { MealMedia } from "../../types/medicalApiTypes";

interface MediaViewerProps {
  media: MealMedia;
  onImageError?: () => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ media, onImageError }) => {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const photoUrls = [
    media.photo_url_1,
    media.photo_url_2,
    media.photo_url_3,
  ].filter((u): u is string => Boolean(u));
  const audioUrls = [media.audio_url_1, media.audio_url_2].filter(
    (u): u is string => Boolean(u),
  );

  if (photoUrls.length === 0 && audioUrls.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Photos */}
      {photoUrls.length > 0 && (
        <div
          className={`grid gap-2 ${photoUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
        >
          {photoUrls.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightboxUrl(url)}
              className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800"
            >
              <img
                src={url}
                alt={`Foto ${i + 1}`}
                className="w-full h-full object-cover"
                onError={onImageError}
              />
            </button>
          ))}
        </div>
      )}

      {/* Audios */}
      {audioUrls.map((url, i) => (
        <div
          key={i}
          className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2"
        >
          <svg
            className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 4.01-3.83 7-7.91 7s-7.42-2.99-7.91-7H0c.49 5.17 4.24 9.4 9.5 9.95V23h5v-2.05C19.76 20.4 23.51 16.17 24 11h-2.09z" />
          </svg>
          <audio controls src={url} className="flex-1 h-8 w-full" />
        </div>
      ))}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt="Foto ampliada"
            className="max-w-full max-h-full object-contain p-4"
          />
          <button
            type="button"
            className="absolute top-4 right-4 text-white p-2"
            onClick={() => setLightboxUrl(null)}
            aria-label="Cerrar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaViewer;
