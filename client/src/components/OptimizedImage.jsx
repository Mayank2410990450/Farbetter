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
    priority = false,
    onLoad,
    onError,
    placeholder,
    quality = 75,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState('');
    const imgRef = useRef(null);

    // Generate optimized image URL
    const getOptimizedSrc = (originalSrc) => {
        if (!originalSrc) return '';

        // If it's a Cloudinary URL, use their transformations
        if (originalSrc.includes('cloudinary')) {
            return originalSrc.replace('/upload/', `/upload/w_800,h_800,c_fill,q_auto,f_auto/`);
        }

        // For local images, return as-is (Vite handles optimization in build)
        return originalSrc;
    };

    useEffect(() => {
        const optimizedSrc = getOptimizedSrc(src);
        setCurrentSrc(optimizedSrc);
    }, [src]);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (priority || !imgRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && currentSrc) {
                        const img = entry.target;
                        if (!img.src) {
                            img.src = currentSrc;
                        }
                        observer.unobserve(img);
                    }
                });
            },
            {
                rootMargin: '50px',
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            if (imgRef.current) {
                observer.unobserve(imgRef.current);
            }
        };
    }, [currentSrc, priority]);

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
            <div className={cn('flex items-center justify-center bg-muted/10 text-muted-foreground', className)}>
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    // Build style object similar to regular img
    const style = {};
    if (objectFit) style.objectFit = objectFit;
    if (!isLoaded && placeholder === 'blur') style.opacity = 0;
    if (isLoaded) style.opacity = 1;
    if (style.opacity !== undefined) style.transition = 'opacity 0.3s ease-in-out';

    return (
        <img
            ref={imgRef}
            src={priority ? currentSrc : undefined}
            data-src={!priority ? currentSrc : undefined}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            style={style}
            className={className}
            {...props}
        />
    );
};

export default OptimizedImage;
