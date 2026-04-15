import { useState } from 'react';

export default function ImageGallery({ images, groundName }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Main Image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '400px',
          borderRadius: '12px',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onClick={() => setShowFullscreen(true)}
      >
        <img
          src={currentImage.image}
          alt={currentImage.caption || `${groundName} - Image ${currentIndex + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.6)',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)')}
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              style={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.6)',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)')}
            >
              ›
            </button>
          </>
        )}

        {/* Image Counter */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          {currentIndex + 1} / {images.length}
        </div>

        {/* Primary Badge */}
        {currentImage.is_primary && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              background: 'var(--accent)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            Featured
          </div>
        )}

        {/* Expand Icon */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            padding: '8px',
            borderRadius: '8px',
            fontSize: '0.9rem',
          }}
        >
          🔍
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 12,
            overflowX: 'auto',
            paddingBottom: 8,
          }}
        >
          {images.map((img, index) => (
            <div
              key={img.id}
              onClick={() => handleThumbnailClick(index)}
              style={{
                minWidth: 80,
                height: 60,
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: index === currentIndex ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.2s',
                opacity: index === currentIndex ? 1 : 0.6,
              }}
              onMouseEnter={(e) => {
                if (index !== currentIndex) e.currentTarget.style.opacity = 0.8;
              }}
              onMouseLeave={(e) => {
                if (index !== currentIndex) e.currentTarget.style.opacity = 0.6;
              }}
            >
              <img
                src={img.image}
                alt={`Thumbnail ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Caption */}
      {currentImage.caption && (
        <p
          style={{
            marginTop: 8,
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
          }}
        >
          {currentImage.caption}
        </p>
      )}

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div
          onClick={() => setShowFullscreen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <button
            onClick={() => setShowFullscreen(false)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
          <img
            src={currentImage.image}
            alt={currentImage.caption || `${groundName} - Image ${currentIndex + 1}`}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
            }}
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                style={{
                  position: 'absolute',
                  left: 20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 50,
                  height: 50,
                  color: 'white',
                  fontSize: '30px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                style={{
                  position: 'absolute',
                  right: 20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 50,
                  height: 50,
                  color: 'white',
                  fontSize: '30px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
