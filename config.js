// Configuration for API endpoints
const CONFIG = {
    // API Base URL - auto-detect based on current location
    API_BASE_URL: (function() {
        if (typeof window !== 'undefined') {
            // In browser: check if we're on localhost (development) or deployed (production)
            const isLocalhost = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1' ||
                               window.location.hostname.includes('localhost');
            
            if (isLocalhost) {
                // For local development, API endpoints are served by form-server on port 3002
                return 'http://localhost:3002';
            } else {
                // For production, API endpoints are Vercel serverless functions on same domain
                return window.location.origin;
            }
        }
        // Fallback for server-side
        return '';
    })(),
    
    // Supabase Configuration - using your actual values
    SUPABASE_URL: 'https://pwvnrtkrnibaxzrduzmj.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dm5ydGtyamlhYnhkcm1heXEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNjgxNzE2NCwiZXhwIjoyMDUyMzkzMTY0fQ.YgqHPg0FGOddvFuApq8gd5Fy8YUrH6X0M-A6EADH2iU'
    
    // API Endpoints
    ENDPOINTS: {
        SUBMIT_REQUEST: '/api/submit-request',
        SUBMISSIONS: '/api/submissions',
        GALLERY_IMAGES: '/api/gallery-images',
        INDEX_CONTENT: '/api/index-content',
        UPLOAD_IMAGE: '/api/upload-image',
        TEST_SUPABASE: '/api/test-supabase'
    }
};

// Helper function to get full API URL
function getApiUrl(endpoint) {
    const baseUrl = CONFIG.API_BASE_URL;
    return `${baseUrl}${endpoint}`;
}

// For browser environments
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.getApiUrl = getApiUrl;
    
    // Debug logging
    console.log('🔧 CONFIG loaded:', CONFIG);
    console.log('🌐 API Base URL:', CONFIG.API_BASE_URL);
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getApiUrl };
}
