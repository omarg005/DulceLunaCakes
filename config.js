// Configuration for API endpoints
const CONFIG = {
    // API Base URL - defaults to current domain in production, localhost in development
    API_BASE_URL: process.env.NODE_ENV === 'production' 
        ? (typeof window !== 'undefined' ? window.location.origin : '') 
        : 'http://localhost:3002',
    
    // Supabase Configuration
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    
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
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getApiUrl };
}
