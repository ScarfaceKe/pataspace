'use client';

/**
 * SkeletonLoader — Animated content placeholders while data loads.
 *
 * Usage:
 *   <SkeletonLoader lines={3} />                     // text lines
 *   <SkeletonLoader variant="card" />                 // card placeholder
 *   <SkeletonLoader variant="avatar" />               // avatar circle
 *   <SkeletonLoader variant="image" height={200} />   // image placeholder
 *   <SkeletonLoader variant="button" />               // button placeholder
 */

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'avatar' | 'image' | 'button' | 'property-card';
  lines?: number;
  width?: string;
  height?: string;
  className?: string;
}

export function SkeletonLoader({
  variant = 'text',
  lines = 1,
  width,
  height,
  className = '',
}: SkeletonLoaderProps) {
  if (variant === 'card') {
    return (
      <div className={`skeleton-card ${className}`} style={{ width, height }}>
        <div className="skeleton-image" />
        <div className="skeleton-text-group">
          <div className="skeleton-text skeleton-text--title" />
          <div className="skeleton-text skeleton-text--subtitle" />
          <div className="skeleton-text skeleton-text--body" />
        </div>
      </div>
    );
  }

  if (variant === 'property-card') {
    return (
      <div className={`skeleton-property-card ${className}`}>
        <div className="skeleton-property-image">
          <div className="skeleton-badge" />
        </div>
        <div className="skeleton-property-content">
          <div className="skeleton-text skeleton-text--title" />
          <div className="skeleton-text skeleton-text--location" />
          <div className="skeleton-text skeleton-text--price" />
          <div className="skeleton-property-tags">
            <div className="skeleton-tag" />
            <div className="skeleton-tag" />
            <div className="skeleton-tag" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'avatar') {
    return <div className={`skeleton-avatar ${className}`} style={{ width: width || '3rem', height: height || '3rem' }} />;
  }

  if (variant === 'image') {
    return <div className={`skeleton-image ${className}`} style={{ width: width || '100%', height: height || '12rem' }} />;
  }

  if (variant === 'button') {
    return <div className={`skeleton-button ${className}`} style={{ width: width || '10rem' }} />;
  }

  // Default: text lines
  return (
    <div className={`skeleton-text-group ${className}`} style={{ width }}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`skeleton-text ${i === 0 ? 'skeleton-text--title' : i === lines - 1 ? 'skeleton-text--body' : 'skeleton-text--subtitle'}`}
          style={{ width: i === lines - 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonPage — Full page skeleton for route transitions.
 */
export function SkeletonPage() {
  return (
    <div className="skeleton-page" aria-label="Loading page content">
      <div className="skeleton-page-header">
        <div className="skeleton-text skeleton-text--title" style={{ width: '30%' }} />
        <div className="skeleton-text skeleton-text--subtitle" style={{ width: '60%' }} />
      </div>
      <div className="skeleton-page-grid">
        <SkeletonLoader variant="property-card" />
        <SkeletonLoader variant="property-card" />
        <SkeletonLoader variant="property-card" />
        <SkeletonLoader variant="property-card" />
        <SkeletonLoader variant="property-card" />
        <SkeletonLoader variant="property-card" />
      </div>
    </div>
  );
}
