import React, { useState, useEffect, useRef } from 'react';

export default function ProductCardImage({ images, name }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const intervalRef = useRef(null);
  const trackRef = useRef(null);

  // Safe parse images string or array
  let galleryImages = [];
  try {
    if (typeof images === 'string') {
      galleryImages = JSON.parse(images);
    } else if (Array.isArray(images)) {
      galleryImages = images;
    }
  } catch (e) {
    galleryImages = [];
  }
  
  if (galleryImages.length === 0) {
    galleryImages = ['/product1.png'];
  }

  const hasMultiple = galleryImages.length > 1;

  useEffect(() => {
    // Only run hover slider cycle on desktop
    if (isHovered && hasMultiple && window.innerWidth > 768) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (window.innerWidth > 768) {
        setCurrentIndex(0);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, hasMultiple, galleryImages.length]);

  const scrollToIndex = (index) => {
    if (trackRef.current) {
      trackRef.current.scrollTo({
        left: index * trackRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    const newIndex = currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    if (window.innerWidth <= 768) {
      scrollToIndex(newIndex);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    const newIndex = currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    if (window.innerWidth <= 768) {
      scrollToIndex(newIndex);
    }
  };

  const handleScroll = (e) => {
    if (window.innerWidth <= 768) {
      const scrollLeft = e.target.scrollLeft;
      const clientWidth = e.target.clientWidth;
      if (clientWidth > 0) {
        const index = Math.round(scrollLeft / clientWidth);
        if (index >= 0 && index < galleryImages.length) {
          setCurrentIndex(index);
        }
      }
    }
  };

  return (
    <div 
      className="premium-card-image-viewport"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        overflow: 'hidden',
        borderRadius: '16px',
        backgroundColor: '#ffffff',
        boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.03)'
      }}
    >
      {/* Loading Skeleton */}
      {!loaded && (
        <div 
          className="image-skeleton-loader"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            zIndex: 2
          }}
        />
      )}

      {/* Image Slider Track */}
      <div 
        ref={trackRef}
        className="image-slider-track"
        onScroll={handleScroll}
        style={{
          display: 'flex',
          width: `${galleryImages.length * 100}%`,
          height: '100%',
          transform: `translateX(-${(currentIndex * 100) / galleryImages.length}%)`,
          transition: 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {galleryImages.map((img, idx) => (
          <div 
            key={idx} 
            style={{ 
              width: `${100 / galleryImages.length}%`, 
              height: '100%',
              overflow: 'hidden'
            }}
          >
            <img 
              src={img} 
              alt={`${name} - ${idx + 1}`}
              loading={idx === 0 ? "eager" : "lazy"}
              onLoad={idx === 0 ? () => setLoaded(true) : undefined}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)',
                transform: !hasMultiple && isHovered ? 'scale(1.03)' : 'scale(1)'
              }}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {hasMultiple && (
        <>
          <button 
            className="card-nav-arrow prev" 
            onClick={handlePrev}
            aria-label="Oldingi rasm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button 
            className="card-nav-arrow next" 
            onClick={handleNext}
            aria-label="Keyingi rasm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </>
      )}

      {/* Pagination dots */}
      {hasMultiple && (
        <div 
          className="slider-dots"
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '6px',
            zIndex: 5,
            padding: '4px 8px',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.3s ease',
            opacity: isHovered ? 1 : 0.6
          }}
        >
          {galleryImages.map((_, idx) => (
            <span 
              key={idx} 
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: currentIndex === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                transition: 'all 0.3s ease',
                transform: currentIndex === idx ? 'scale(1.2)' : 'scale(1)'
              }}
            />
          ))}
        </div>
      )}

      {/* Image Counter (Top-right corner) */}
      {hasMultiple && (
        <div 
          className="image-counter-badge"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '20px',
            zIndex: 5,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {currentIndex + 1}/{galleryImages.length}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .card-nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #18181b;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0;
          z-index: 10;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
          padding: 0;
        }
        .card-nav-arrow svg {
          width: 16px;
          height: 16px;
        }
        .premium-card-image-viewport:hover .card-nav-arrow {
          opacity: 1;
        }
        .card-nav-arrow:hover {
          background: #ffffff;
          transform: translateY(-50%) scale(1.1);
          color: #bda10d;
        }
        .card-nav-arrow.prev {
          left: 10px;
        }
        .card-nav-arrow.next {
          right: 10px;
        }
        @media (max-width: 768px) {
          .image-slider-track {
            transform: none !important;
            width: 100% !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch !important;
            display: flex !important;
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
          .image-slider-track::-webkit-scrollbar {
            display: none !important;
          }
          .image-slider-track > div {
            width: 100% !important;
            flex-shrink: 0 !important;
            scroll-snap-align: start !important;
          }
          .card-nav-arrow {
            opacity: 0.7;
            width: 28px;
            height: 28px;
          }
          .card-nav-arrow.prev {
            left: 8px;
          }
          .card-nav-arrow.next {
            right: 8px;
          }
        }
      `}</style>
    </div>
  );
}
