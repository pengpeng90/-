/**
 * Fetches an image from a URL and converts it to a Base64 string.
 * Includes a retry mechanism using a CORS proxy to handle external images
 * that do not allow direct browser fetching.
 */
export const urlToBase64 = async (url: string): Promise<string> => {
  
  // OPTIMIZATION & FIX: If it's already a data URI, return it immediately.
  // We return the FULL data URI here because if it's an SVG (e.g. fallback),
  // we need to preserve the "image/svg+xml" mime type so that downstream
  // functions (like resizeImageBase64) can load it correctly.
  // If we stripped the prefix, downstream might default to 'image/png' and fail to render SVG data.
  if (url.startsWith('data:')) {
      return Promise.resolve(url);
  }

  // Helper to check if URL is relative/local
  const isLocalUrl = (u: string) => u.startsWith('/') || u.startsWith('./') || !u.startsWith('http');

  // Helper to try fetching
  const fetchWithRetry = async (targetUrl: string, useProxy = false): Promise<Blob> => {
    // If it's a local URL, we cannot use the proxy
    if (useProxy && isLocalUrl(targetUrl)) {
        throw new Error("Cannot use CORS proxy for local/relative URLs");
    }

    const finalUrl = useProxy 
      ? `https://corsproxy.io/?${encodeURIComponent(targetUrl)}` 
      : targetUrl;
      
    const response = await fetch(finalUrl);
    
    if (!response.ok) {
      const err = new Error(`Failed to fetch ${targetUrl}. Status: ${response.status}`);
      (err as any).status = response.status;
      throw err;
    }

    // CRITICAL: Check if the server returned HTML (common in SPAs for 404s)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
        const err = new Error(`File not found (server returned HTML for ${targetUrl})`);
        (err as any).status = 404;
        throw err;
    }

    return response.blob();
  };

  try {
    let blob: Blob;
    try {
      // First try: Direct fetch
      blob = await fetchWithRetry(url, false);
    } catch (directError: any) {
      // If it's a local file 404 (or HTML returned), throw immediately to trigger fallback
      if (isLocalUrl(url) && directError.status === 404) {
          throw directError;
      }

      // Only retry with proxy if it's NOT a local/relative URL
      if (!isLocalUrl(url)) {
          try {
            blob = await fetchWithRetry(url, true);
          } catch (proxyError) {
            console.warn("Proxy fetch also failed for", url);
            throw proxyError;
          }
      } else {
          throw directError;
      }
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        if (base64data && base64data.includes(',')) {
          const rawBase64 = base64data.split(',')[1];
          resolve(rawBase64);
        } else {
            resolve(base64data);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Helper to ensure the base64 string is formatted for the <img> src attribute
 */
export const getSrcFromBase64 = (base64: string, mimeType = 'image/png') => {
    if (!base64) return '';
    if (base64.startsWith('data:')) return base64;
    return `data:${mimeType};base64,${base64}`;
};

/**
 * Downloads the base64 image directly without background removal
 */
export const downloadImage = (base64Data: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = getSrcFromBase64(base64Data);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Resizes a base64 image to a maximum dimension while maintaining aspect ratio.
 * This helps reduce payload size for API requests.
 */
export const resizeImageBase64 = (base64: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      
      // Calculate new dimensions
      if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
      } else {
          // If smaller than max, keep original, but still draw to canvas to ensure clean PNG format
          // or just resolve original if we want to be faster. 
          // Re-drawing ensures we strip any weird metadata.
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
          reject(new Error("Canvas context failed"));
          return;
      }
      
      // Fill white background to handle transparency
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Export as PNG
      const dataUrl = canvas.toDataURL('image/png');
      const raw = dataUrl.split(',')[1];
      resolve(raw);
    };
    img.onerror = (err) => reject(err);
    img.src = getSrcFromBase64(base64);
  });
};