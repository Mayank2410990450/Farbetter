// Lazy-load Razorpay script only when needed
let razorpayScriptLoaded = false;
let razorpayScriptPromise = null;

export const loadRazorpayScript = () => {
    // Return existing promise if script is already loading
    if (razorpayScriptPromise) {
        return razorpayScriptPromise;
    }

    // Return resolved promise if script is already loaded
    if (razorpayScriptLoaded) {
        return Promise.resolve(true);
    }

    // Create new promise to load script
    razorpayScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.defer = true;

        script.onload = () => {
            razorpayScriptLoaded = true;
            resolve(true);
        };

        script.onerror = () => {
            razorpayScriptPromise = null; // Reset so it can be retried
            reject(new Error('Failed to load Razorpay script'));
        };

        document.body.appendChild(script);
    });

    return razorpayScriptPromise;
};

// Preload Razorpay script (optional - call this on pages with payment buttons)
export const preloadRazorpayScript = () => {
    if (typeof window !== 'undefined' && !razorpayScriptLoaded && !razorpayScriptPromise) {
        // Use requestIdleCallback to preload during idle time
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => loadRazorpayScript(), { timeout: 3000 });
        } else {
            setTimeout(() => loadRazorpayScript(), 2000);
        }
    }
};
