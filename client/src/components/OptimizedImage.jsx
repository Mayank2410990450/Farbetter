import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Optimized Image Component (Next.js-like for React + Vite)
 * 
 * Features:
 * - Lazy loading by default
 * - Responsive images
 * - Loading placeholder (optional)
 * - Error handling
 * - Supports Cloudinary optimization
 * 
 * Usage:
 * <OptimizedImage 
 *   src="/path/to/image.jpg"
 *   alt="Description"
 *   className="w-full h-auto"
 *   priority={false}  // Set true to disable lazy loading
 * />
 */

const OptimizedImage = ({
    src,
    alt = '',
    width,
    height,
    className = '',
    objectFit,
    priority = false, // If true, eager load and high priority
    onLoad,
    onError,
    placeholder = 'blur', // blur, empty
    quality = 'auto',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);

    // Generate optimized image URL for Cloudinary
    const getOptimizedSrc = (originalSrc, w) => {
        if (!originalSrc) return '';
        if (originalSrc.includes('cloudinary')) {
            // Default params
            let params = `q_${quality},f_auto`;

            // Add resize params if width/height provided
            if (w) {
                params += `,w_${w}`;
            } else if (width) {
                // Use prop width if strictly provided (removing px if string)
                const cleanW = String(width).replace('px', '');
                if (!isNaN(cleanW)) params += `,w_${cleanW}`;
            }
            // If height provided and object fit is cover, we might want to crop
            if (height && objectFit === 'cover') {
                const cleanH = String(height).replace('px', '');
                if (!isNaN(cleanH)) params += `,h_${cleanH},c_fill`;
            }

            return originalSrc.replace('/upload/', `/upload/${params}/`);
        }
        return originalSrc;
    };

    const optimizedSrc = getOptimizedSrc(src);

    // Generate srcSet for responsive images if it's strictly a Cloudinary image
    const generateSrcSet = () => {
        if (!src || !src.includes('cloudinary')) return undefined;
        const widths = [320, 640, 768, 1024, 1280];
        return widths.map(w => `${getOptimizedSrc(src, w)} ${w}w`).join(', ');
    };

    const handleLoad = (e) => {
        setIsLoaded(true);
        if (onLoad) onLoad(e);
    };

    const handleError = (e) => {
        setHasError(true);
        setIsLoaded(true);
        if (onError) onError(e);
    };

    if (hasError) {
        return (
            <div className={cn('flex items-center justify-center bg-muted/10 text-muted-foreground', className)} style={{ width, height }}>
                <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    // Styles for smooth transition
    const baseStyle = {
        transition: 'opacity 0.4s ease-out',
        opacity: isLoaded ? 1 : (placeholder === 'blur' ? 0.05 : 1), // Start low opacity if blur
        objectFit: objectFit || 'cover',
    };

    // Default sizes for typical grid layouts if not provided
    const defaultSizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

    return (
        <img
            ref={imgRef}
            src={optimizedSrc}
            srcSet={generateSrcSet()}
            sizes={props.sizes || defaultSizes}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            fetchpriority={priority ? 'high' : 'auto'}
            decoding={priority ? 'sync' : 'async'}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(className, "will-change-opacity")}
            style={{ ...baseStyle }}
            {...props}
        />
    );
};

export default OptimizedImage;
