// Admin Panel JavaScript
console.log('=== ADMIN.JS SCRIPT LOADED ===');

// Configuration
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'dulceluna2025' // Change this to a secure password
};

// Supabase Auth Integration
let supabaseAuthService = null;
let authState = {
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    fallbackMode: false
};

// Try to load Supabase auth service
async function initSupabaseAuth() {
    console.log('=== STARTING SUPABASE INIT ===');
    console.log('window.supabase available:', !!window.supabase);
    
    try {
        // Check if Supabase is available globally
        if (!window.supabase) {
            console.error('Supabase not loaded from CDN');
            throw new Error('Supabase not loaded');
        }
        
        console.log('Supabase CDN loaded successfully');
        
        // Initialize Supabase client directly
        const supabaseUrl = 'https://pwvnrtkrnibaxzrduzmj.supabase.co';
        const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dm5ydGtybmliYXh6cmR1em1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTk1NjEsImV4cCI6MjA3MTIzNTU2MX0.E_IntUR0qo5j75Xc4rlP1YCB_Seq-cM42M8ntE1C-zY';
        
        console.log('Creating Supabase client with URL:', supabaseUrl);
        const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        console.log('Supabase client created:', !!supabaseClient);
        
        // Initialize simple auth service
        supabaseAuthService = {
            async getCurrentUser() {
                try {
                    const { data: { user }, error } = await supabaseClient.auth.getUser();
                    console.log('getCurrentUser raw result:', { user, error });
                    return { success: !error, user, error: error?.message };
                } catch (err) {
                    console.log('getCurrentUser catch:', err);
                    return { success: false, error: err.message };
                }
            },
            async signIn(email, password) {
                try {
                    const { data, error } = await supabaseClient.auth.signInWithPassword({
                        email,
                        password
                    });
                    return { success: !error, user: data.user, session: data.session, error: error?.message };
                } catch (err) {
                    return { success: false, error: err.message };
                }
            },
            async signOut() {
                try {
                    const { error } = await supabaseClient.auth.signOut();
                    return { success: !error, error: error?.message };
                } catch (err) {
                    return { success: false, error: err.message };
                }
            },
            async resetPassword(email) {
                try {
                    const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
                    return { success: !error, error: error?.message };
                } catch (err) {
                    return { success: false, error: err.message };
                }
            },
            fallbackAuth: async (username, password) => {
                return await fallbackLogin(username, password);
            },
            clearFallbackAuth: async () => {
                localStorage.removeItem('fallback_session');
                return { success: true };
            }
        };
        
        // Simple test - if we got this far, Supabase is working
        console.log('Skipping complex test, Supabase client created successfully');
        
        // Initialize auth state directly
        authState.fallbackMode = false;
        authState.isLoading = false;
        console.log('✅ Supabase Auth initialized successfully (direct mode)');
        return true;
    } catch (error) {
        console.warn('Supabase Auth not available, using fallback:', error.message);
        authState.fallbackMode = true;
        authState.isLoading = false;
    }
    return false;
}

// Global variables
let currentPage = 'index';
let currentEditingImage = null;
let changes = {};
let PAGE_CONTENT = {};

// Data fetching functions - Updated for Supabase
async function getRequests() {
    try {
        // Check if CONFIG and getApiUrl are available
        if (typeof CONFIG === 'undefined' || typeof getApiUrl === 'undefined') {
            console.warn('⚠️ CONFIG or getApiUrl not available, creating fallback...');
            
            // Create fallback CONFIG with environment detection
            const isLocalhost = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1';
            
            const fallbackConfig = {
                API_BASE_URL: isLocalhost ? 'http://localhost:3002' : window.location.origin,
                ENDPOINTS: {
                    SUBMISSIONS: '/api/submissions'
                }
            };
            
            const apiUrl = `${fallbackConfig.API_BASE_URL}${fallbackConfig.ENDPOINTS.SUBMISSIONS}`;
            console.log('🔍 Using fallback URL:', apiUrl);
            console.log('🌍 Environment:', isLocalhost ? 'localhost' : 'production');
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📊 API Response (fallback):', data);
            
            if (data.success && Array.isArray(data.submissions)) {
                console.log(`✅ Loaded ${data.submissions.length} requests from Supabase (fallback)`);
                return data.submissions;
            } else {
                throw new Error('Invalid API response format');
            }
        }
        
        const apiUrl = getApiUrl(CONFIG.ENDPOINTS.SUBMISSIONS);
        console.log('🔍 Fetching requests from:', apiUrl);
        
        // Try to fetch from Supabase API first
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 API Response:', data);
        
        if (data.success && Array.isArray(data.submissions)) {
            console.log(`✅ Loaded ${data.submissions.length} requests from Supabase`);
            return data.submissions;
        } else {
            console.warn('⚠️ Supabase API failed, falling back to localStorage:', data);
            // Fallback to localStorage (sandbox mode)
            const localRequests = JSON.parse(localStorage.getItem('sandboxRequests') || '[]');
            console.log(`🏠 Loaded ${localRequests.length} requests from localStorage`);
            return localRequests;
        }
    } catch (error) {
        console.error('❌ Error fetching requests:', error);
        // Fallback to localStorage
        const localRequests = JSON.parse(localStorage.getItem('sandboxRequests') || '[]');
        console.log(`🏠 Fallback: Loaded ${localRequests.length} requests from localStorage`);
        return localRequests;
    }
}

// Legacy function for backward compatibility
function getSandboxRequests() {
    return JSON.parse(localStorage.getItem('sandboxRequests') || '[]');
}

async function updateRequestStatus(requestId, newStatus, notes = '') {
    try {
        // Check if CONFIG and getApiUrl are available
        if (typeof CONFIG === 'undefined' || typeof getApiUrl === 'undefined') {
            console.warn('⚠️ CONFIG or getApiUrl not available for status update, creating fallback...');
            
            // Create fallback CONFIG with environment detection
            const isLocalhost = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1';
            
            const fallbackConfig = {
                API_BASE_URL: isLocalhost ? 'http://localhost:3002' : window.location.origin,
                ENDPOINTS: {
                    SUBMISSIONS: '/api/submissions'
                }
            };
            
            const apiUrl = `${fallbackConfig.API_BASE_URL}${fallbackConfig.ENDPOINTS.SUBMISSIONS}/${requestId}/status`;
            console.log('🔄 Using fallback URL for status update:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    status: newStatus,
                    notes: notes
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Status updated via Supabase API (fallback)');
                loadRequests(); // Refresh the display
                showMessage(`Request status updated to ${newStatus}`, 'success');
                return true;
            } else {
                throw new Error(result.error || 'Failed to update status');
            }
        }
        
        // Try to update via Supabase API first
        const response = await fetch(getApiUrl(`${CONFIG.ENDPOINTS.SUBMISSIONS}/${requestId}/status`), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                status: newStatus,
                notes: notes
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Status updated via Supabase API');
            loadRequests(); // Refresh the display
            showMessage(`Request status updated to ${newStatus}`, 'success');
            return true;
        } else {
            throw new Error(result.error || 'Failed to update status');
        }
    } catch (error) {
        console.error('Error updating status via API:', error);
        
        // Fallback to localStorage for sandbox mode
        const requests = getSandboxRequests();
        const requestIndex = requests.findIndex(req => req.id === requestId);
        if (requestIndex !== -1) {
            requests[requestIndex].status = newStatus;
            requests[requestIndex].lastUpdated = new Date().toISOString();
            localStorage.setItem('sandboxRequests', JSON.stringify(requests));
            loadRequests(); // Refresh the display
            showMessage(`Request status updated to ${newStatus} (local storage)`, 'success');
            return true;
        }
        
        showMessage('Failed to update request status', 'error');
        return false;
    }
}

// Legacy function for backward compatibility
function updateSandboxRequestStatus(requestId, newStatus) {
    updateRequestStatus(requestId, newStatus);
}

async function deleteRequest(requestId) {
    try {
        // Check if CONFIG and getApiUrl are available
        if (typeof CONFIG === 'undefined' || typeof getApiUrl === 'undefined') {
            console.warn('⚠️ CONFIG or getApiUrl not available for delete, creating fallback...');
            
            // Create fallback CONFIG with environment detection
            const isLocalhost = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1';
            
            const fallbackConfig = {
                API_BASE_URL: isLocalhost ? 'http://localhost:3002' : window.location.origin,
                ENDPOINTS: {
                    SUBMISSIONS: '/api/submissions'
                }
            };
            
            const apiUrl = `${fallbackConfig.API_BASE_URL}${fallbackConfig.ENDPOINTS.SUBMISSIONS}/${requestId}`;
            console.log('🗑️ Using fallback URL for delete:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Request deleted via Supabase API (fallback)');
                loadRequests(); // Refresh the display
                showMessage('Request deleted successfully', 'success');
                return true;
            } else {
                throw new Error(result.error || 'Failed to delete request');
            }
        }
        
        // Try to delete via Supabase API first
        const response = await fetch(getApiUrl(`${CONFIG.ENDPOINTS.SUBMISSIONS}/${requestId}`), {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Request deleted via Supabase API');
            loadRequests(); // Refresh the display
            showMessage('Request deleted successfully', 'success');
            return true;
        } else {
            throw new Error(result.error || 'Failed to delete request');
        }
    } catch (error) {
        console.error('Error deleting request via API:', error);
        
        // Fallback to localStorage for sandbox mode
        const requests = getSandboxRequests();
        const filteredRequests = requests.filter(req => req.id !== requestId);
        localStorage.setItem('sandboxRequests', JSON.stringify(filteredRequests));
        loadRequests(); // Refresh the display
        showMessage('Request deleted (local storage)', 'success');
        return true;
    }
}

// Legacy function for backward compatibility
function deleteSandboxRequest(requestId) {
    deleteRequest(requestId);
}

function updateModeIndicator() {
    const modeIndicator = document.getElementById('current-mode');
    if (modeIndicator) {
        // Determine mode based on Supabase connection and server availability
        // Since we're connected to Supabase and have active servers, we're in production mode
        const isSandboxMode = false; // We're now using Supabase, so we're in production mode
        modeIndicator.textContent = isSandboxMode ? 'Sandbox Mode' : 'Production Mode';
        modeIndicator.style.backgroundColor = isSandboxMode ? 'var(--accent-mint)' : 'var(--primary-pink)';
        modeIndicator.style.color = isSandboxMode ? 'var(--text-dark)' : 'white';
    }
}

function updateAuthDisplay() {
    const userInfoElement = document.getElementById('user-info');
    const authModeElement = document.getElementById('auth-mode');
    const systemConfigPanel = document.getElementById('system-config-panel');
    
    if (userInfoElement && authState.user) {
        const userName = authState.user.user_metadata?.name || 
                        authState.user.email || 
                        'Admin User';
        userInfoElement.textContent = `Welcome, ${userName}`;
    }
    
    if (authModeElement) {
        const authMode = authState.fallbackMode ? 'Local Auth' : 'Supabase Auth';
        authModeElement.textContent = authMode;
        authModeElement.style.backgroundColor = authState.fallbackMode ? 'orange' : 'green';
        authModeElement.style.color = 'white';
        authModeElement.style.padding = '4px 8px';
        authModeElement.style.borderRadius = '4px';
        authModeElement.style.fontSize = '0.8rem';
        authModeElement.style.marginLeft = '1rem';
    }
    
    // Show/hide system configuration panel based on auth mode
    if (systemConfigPanel) {
        // Show config panel only in fallback/local auth mode (sandbox mode)
        // Hide it when using Supabase Auth (production mode)
        systemConfigPanel.style.display = authState.fallbackMode ? 'block' : 'none';
    }
}

// Helper function to get target elements based on content type and order
function getTargetElementsForType(type, orderIndex) {
    switch (type) {
        case 'hero':
            return {
                image: ".hero::before",
                title: ".hero-title",
                description: ".hero-subtitle"
            };
        case 'featured':
            const cardIndex = orderIndex + 1; // CSS nth-child is 1-based
            return {
                image: `.cake-card:nth-child(${cardIndex}) img`,
                title: `.cake-card:nth-child(${cardIndex}) h3`,
                description: `.cake-card:nth-child(${cardIndex}) p`
            };
        case 'about':
            return {
                image: ".about-image img",
                title: ".about-text h2",
                description: ".about-text p"
            };
        default:
            return {};
    }
}

// Load page content from Supabase API with fallback to JSON files
async function loadPageContentData() {
    try {
        let indexData, aboutData, galleryData;
        
        // Try to load from Supabase API first
        try {
            console.log('Loading data from Supabase API...');
            
            // Check if CONFIG and getApiUrl are available
            if (typeof CONFIG === 'undefined' || typeof getApiUrl === 'undefined') {
                throw new Error('CONFIG or getApiUrl not available');
            }
            
            // Load index content from Supabase
            const indexResponse = await fetch(getApiUrl(CONFIG.ENDPOINTS.INDEX_CONTENT));
            const indexResult = await indexResponse.json();
            
            if (indexResult.success) {
                // Convert Supabase format to admin panel format
                indexData = indexResult.content.map(item => ({
                    filename: item.image_url ? item.image_url.split('/').pop() : 'unknown',
                    title: item.title,
                    description: item.description,
                    path: item.image_url || `images/index/${item.title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
                    type: item.type,
                    targetElements: getTargetElementsForType(item.type, item.order_index),
                    supabaseId: item.id // Store Supabase ID for updates
                }));
                
                // Separate about data
                aboutData = indexData.filter(item => item.type === 'about');
                indexData = indexData.filter(item => item.type !== 'about');
                
                console.log(`✅ Loaded ${indexData.length} index items and ${aboutData.length} about items from Supabase`);
            } else {
                throw new Error(`Supabase API failed: ${indexResult.error}`);
            }
            
            // Load gallery data from Supabase
            const galleryResponse = await fetch(getApiUrl(CONFIG.ENDPOINTS.GALLERY_IMAGES));
            const galleryResult = await galleryResponse.json();
            
            if (galleryResult.success) {
                galleryData = galleryResult.images.map(item => ({
                    filename: item.image_url ? item.image_url.split('/').pop() : 'unknown',
                    title: item.title,
                    description: item.description,
                    path: item.image_url || `images/gallery/${item.title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
                    supabaseId: item.id // Store Supabase ID for updates
                }));
                
                console.log(`✅ Loaded ${galleryData.length} gallery items from Supabase`);
            } else {
                throw new Error(`Supabase gallery API failed: ${galleryResult.error}`);
            }
            
        } catch (apiError) {
            console.warn('Supabase API failed, falling back to local JSON files:', apiError.message);
            
            // Fallback to local JSON files
            const indexResponse = await fetch('images/index/index_data.json');
            indexData = await indexResponse.json();
            
            const aboutResponse = await fetch('images/about/about_data.json');
            aboutData = await aboutResponse.json();
            
            const galleryResponse = await fetch('images/gallery/gallery_data.json');
            galleryData = await galleryResponse.json();
            
            console.log('✅ Loaded data from local JSON files as fallback');
        }
        
        // Convert to admin panel format
        PAGE_CONTENT = {
            index: {
                title: 'Home Page Content',
                images: indexData.map(item => ({
                    id: item.filename.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    name: item.title,
                    currentImage: item.path,
                    currentTitle: item.title,
                    currentDescription: item.description,
                    targetFile: item.path,
                    targetElements: item.targetElements,
                    isHero: item.type === 'hero'
                }))
            },
            about: {
                title: 'About Page Content',
                images: aboutData.map(item => ({
                    id: item.filename.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    name: item.title,
                    currentImage: item.path,
                    currentTitle: item.title,
                    currentDescription: item.description,
                    targetFile: item.path,
                    targetElements: item.targetElements
                }))
            },
            gallery: {
                title: 'Gallery Content',
                images: galleryData.map((item, index) => ({
                    id: `gallery-${index + 1}`,
                    name: item.title,
                    currentImage: item.path,
                    currentTitle: item.title,
                    currentDescription: item.description,
                    targetFile: item.path,
                    targetElements: {
                        image: `.gallery-item:nth-child(${index + 1}) img`,
                        title: `.gallery-item:nth-child(${index + 1}) h3`,
                        description: `.gallery-item:nth-child(${index + 1}) p`
                    }
                }))
            },
            requests: {
                title: 'Review Cake Requests',
                isRequestsPage: true
            }
        };
        
        console.log('Page content loaded successfully');
        
        // If already logged in, load the current page
        if (localStorage.getItem('adminLoggedIn') === 'true') {
            await loadPageContent(currentPage);
        }
    } catch (error) {
        console.error('Error loading page content:', error);
        showMessage('Error loading page content. Please refresh the page.', 'error');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - moved inside DOMContentLoaded
    const loginScreen = document.getElementById('login-screen');
    const adminDashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const pageTabs = document.querySelectorAll('.page-tab');
    const pageTitle = document.getElementById('page-title');
    const imageGrid = document.getElementById('image-grid');
    const saveAllBtn = document.getElementById('save-all-btn');
    const imageModal = document.getElementById('image-modal');
    const closeModal = document.getElementById('close-modal');
    const cancelEdit = document.getElementById('cancel-edit');
    const imageEditForm = document.getElementById('image-edit-form');
    const currentImage = document.getElementById('current-image');
    const newImageInput = document.getElementById('new-image');
    const imageTitleInput = document.getElementById('image-title');
    const imageDescriptionInput = document.getElementById('image-description');
    const messageContainer = document.getElementById('message-container');
    console.log('Admin panel loaded');
    
    // Debug: Check if elements exist
    console.log('Login form:', loginForm);
    console.log('Admin dashboard:', adminDashboard);
    console.log('Image grid:', imageGrid);
    
    // Initialize authentication and load page content
    initSupabaseAuth().then(() => {
        return loadPageContentData();
    }).then(async () => {
        // Check authentication state
        if (authState.isAuthenticated || localStorage.getItem('adminLoggedIn') === 'true') {
            console.log('User already logged in');
            await showDashboard();
        }
        
        // Update mode indicator
        updateModeIndicator();
        updateAuthDisplay();
    }).catch(async (error) => {
        console.error('Error during initialization:', error);
        // Fallback to basic auth check
        if (localStorage.getItem('adminLoggedIn') === 'true') {
            await showDashboard();
        }
        updateModeIndicator();
    });
    
    // Login form
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.error('Login form not found');
    }
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    } else {
        console.error('Logout button not found');
    }
    
    // Forgot password
    const forgotPasswordBtn = document.getElementById('forgot-password-btn');
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', handleForgotPassword);
    }
    
    // Image preview functionality
    if (newImageInput) {
        newImageInput.addEventListener('change', handleImagePreview);
    }
    
    // Page tabs
    if (pageTabs && pageTabs.length > 0) {
        pageTabs.forEach(tab => {
            tab.addEventListener('click', async () => await switchPage(tab.dataset.page));
        });
    } else {
        console.error('Page tabs not found');
    }
    
    // Modal controls
    if (closeModal) {
        closeModal.addEventListener('click', closeImageModal);
    } else {
        console.error('Close modal button not found');
    }
    
    if (cancelEdit) {
        cancelEdit.addEventListener('click', closeImageModal);
    } else {
        console.error('Cancel edit button not found');
    }
    
    // Image edit form
    if (imageEditForm) {
        imageEditForm.addEventListener('submit', handleImageEdit);
    } else {
        console.error('Image edit form not found');
    }
    
    // Save all changes
    if (saveAllBtn) {
        saveAllBtn.addEventListener('click', saveAllChanges);
    } else {
        console.error('Save all button not found');
    }
    
    // Close modal on outside click
    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                closeImageModal();
            }
        });
    } else {
        console.error('Image modal not found');
    }
    
    // Mobile navigation toggle
    const navToggle = document.getElementById('nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            // Add any mobile menu functionality here if needed
        });
    }
});

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('Login attempt:', { username, password });
    console.log('Auth state:', authState);
    console.log('Supabase service available:', !!supabaseAuthService);
    console.log('Fallback mode:', authState.fallbackMode);
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Signing in...';
    submitBtn.disabled = true;
    
    try {
        let result;
        
        if (supabaseAuthService && !authState.fallbackMode) {
            // Try Supabase authentication first
            console.log('Attempting Supabase authentication...');
            result = await supabaseAuthService.signIn(username, password);
            console.log('Supabase auth result:', result);
            
            if (result.success) {
                authState.user = result.user;
                authState.session = result.session;
                authState.isAuthenticated = true;
                localStorage.setItem('adminLoggedIn', 'true');
                await showDashboard();
                showMessage('Login successful!', 'success');
                return;
            } else {
                // If Supabase fails, try fallback
                console.warn('Supabase login failed, trying fallback:', result.error);
                result = await supabaseAuthService.fallbackAuth(username, password);
            }
        } else {
            // Use fallback authentication
            result = await fallbackLogin(username, password);
        }
        
        if (result.success) {
            if (result.fallback) {
                authState.user = result.user;
                authState.session = result.session;
                authState.isAuthenticated = true;
                authState.fallbackMode = true;
            }
            localStorage.setItem('adminLoggedIn', 'true');
            await showDashboard();
            showMessage(result.message || 'Login successful!', 'success');
        } else {
            showLoginError(result.error || 'Invalid username or password');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showLoginError('Login failed. Please try again.');
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Fallback login function
async function fallbackLogin(username, password) {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const fallbackSession = {
            user: {
                id: 'fallback-admin',
                email: 'admin@dulcelunacakes.com',
                user_metadata: { name: 'Admin User' }
            },
            access_token: 'fallback-token',
            expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };

        return {
            success: true,
            user: fallbackSession.user,
            session: fallbackSession,
            message: 'Login successful (local mode)',
            fallback: true
        };
    }

    return {
        success: false,
        error: 'Invalid username or password',
        fallback: true
    };
}

async function handleLogout() {
    try {
        // Sign out from Supabase if available
        if (supabaseAuthService && !authState.fallbackMode) {
            await supabaseAuthService.signOut();
        } else if (supabaseAuthService && authState.fallbackMode) {
            await supabaseAuthService.clearFallbackAuth();
        }
        
        // Clear auth state
        authState.user = null;
        authState.session = null;
        authState.isAuthenticated = false;
        
        // Clear local storage
        localStorage.removeItem('adminLoggedIn');
        
        showLoginScreen();
        showMessage('Logged out successfully', 'success');
        
    } catch (error) {
        console.error('Logout error:', error);
        // Still proceed with logout even if there's an error
        localStorage.removeItem('adminLoggedIn');
        showLoginScreen();
        showMessage('Logged out', 'success');
    }
}

async function handleForgotPassword() {
    const email = document.getElementById('username').value;
    
    if (!email) {
        showLoginError('Please enter your email address');
        return;
    }
    
    if (!supabaseAuthService || authState.fallbackMode) {
        showLoginError('Password reset is only available with Supabase authentication. Please contact administrator.');
        return;
    }
    
    try {
        const result = await supabaseAuthService.resetPassword(email);
        
        if (result.success) {
            showLoginSuccess('Password reset email sent! Check your inbox.');
        } else {
            showLoginError(result.error || 'Failed to send password reset email');
        }
    } catch (error) {
        console.error('Password reset error:', error);
        showLoginError('Failed to send password reset email');
    }
}

function showLoginScreen() {
    const loginScreen = document.getElementById('login-screen');
    const adminDashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    
    loginScreen.classList.remove('hidden');
    adminDashboard.classList.add('hidden');
    loginForm.reset();
    loginError.style.display = 'none';
}

async function showDashboard() {
    console.log('showDashboard called');
    const loginScreen = document.getElementById('login-screen');
    const adminDashboard = document.getElementById('admin-dashboard');
    
    console.log('loginScreen:', loginScreen);
    console.log('adminDashboard:', adminDashboard);
    
    if (loginScreen && adminDashboard) {
        loginScreen.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        console.log('Dashboard should now be visible');
        await loadPageContent(currentPage);
        updateModeIndicator(); // Update mode indicator when dashboard is shown
    } else {
        console.error('Login screen or admin dashboard not found');
    }
}

function showLoginError(message) {
    const loginError = document.getElementById('login-error');
    const loginSuccess = document.getElementById('login-success');
    
    // Hide success message
    if (loginSuccess) {
        loginSuccess.style.display = 'none';
    }
    
    loginError.textContent = message;
    loginError.style.display = 'block';
}

function showLoginSuccess(message) {
    const loginSuccess = document.getElementById('login-success');
    const loginError = document.getElementById('login-error');
    
    // Hide error message
    if (loginError) {
        loginError.style.display = 'none';
    }
    
    if (loginSuccess) {
        loginSuccess.textContent = message;
        loginSuccess.style.display = 'block';
    }
}

// Page Management Functions
async function switchPage(page) {
    currentPage = page;
    
    // Update active tab
    const pageTabs = document.querySelectorAll('.page-tab');
    pageTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.page === page);
    });
    
    // Load page content
    await loadPageContent(page);
}

async function loadPageContent(page) {
    const content = PAGE_CONTENT[page];
    if (!content) return;
    
    const pageTitle = document.getElementById('page-title');
    // Prepend icon for requests page
    if (page === 'requests') {
        pageTitle.innerHTML = `<i class="fas fa-clipboard-list" style="margin-right:8px;"></i>${content.title}`;
    } else {
        pageTitle.textContent = content.title;
    }
    
    if (content.isRequestsPage) {
        await loadRequests();
    } else {
        renderImageGrid(content.images);
    }
}

function renderImageGrid(images) {
    const imageGrid = document.getElementById('image-grid');
    imageGrid.innerHTML = '';
    
    images.forEach(image => {
        const imageCard = createImageCard(image);
        imageGrid.appendChild(imageCard);
    });
    
    // Add error handling for images
    const imageElements = imageGrid.querySelectorAll('.image-preview img');
    imageElements.forEach(img => {
        img.addEventListener('error', function() {
            this.parentElement.innerHTML = '<div class="placeholder">Image not found</div>';
        });
    });
}

function createImageCard(image) {
    const card = document.createElement('div');
    card.className = 'image-card';
    
    const heroBadge = image.isHero ? '<span class="hero-badge">Hero Background</span>' : '';
    
    card.innerHTML = `
        <div class="image-card-header">
            <h4>${image.name} ${heroBadge}</h4>
        </div>
        <div class="image-card-content">
            <div class="image-preview">
                <img src="${image.currentImage}" alt="${image.currentTitle}">
            </div>
            <div class="image-info">
                <p><strong>Title:</strong> ${image.currentTitle}</p>
                <p><strong>Description:</strong> ${image.currentDescription.substring(0, 50)}${image.currentDescription.length > 50 ? '...' : ''}</p>
            </div>
            <div class="image-actions">
                <button class="edit-button" onclick="editImage('${image.id}')">
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Image Editing Functions
function editImage(imageId) {
    const content = PAGE_CONTENT[currentPage];
    const image = content.images.find(img => img.id === imageId);
    
    if (!image) return;
    
    currentEditingImage = image;
    
    // Populate modal
    const currentImage = document.getElementById('current-image');
    const currentImageContainer = document.getElementById('current-image-container');
    const imageTitleInput = document.getElementById('image-title');
    const imageDescriptionInput = document.getElementById('image-description');
    const imageModal = document.getElementById('image-modal');
    
    // Set image source and show it
    currentImage.onload = function() {
        currentImage.style.display = 'block';
        currentImageContainer.style.display = 'none';
    };
    
    currentImage.onerror = function() {
        currentImageContainer.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>Image not found</p>';
        currentImageContainer.style.display = 'block';
        currentImage.style.display = 'none';
    };
    
    currentImage.src = image.currentImage;
    
    imageTitleInput.value = image.currentTitle;
    imageDescriptionInput.value = image.currentDescription;
    
    // Reset new image preview
    const newImagePreviewContainer = document.getElementById('new-image-preview-container');
    const newImageInput = document.getElementById('new-image');
    newImagePreviewContainer.style.display = 'none';
    newImageInput.value = '';
    
    // Show modal
    imageModal.classList.remove('hidden');
}

// Handle image preview when user selects a new image
function handleImagePreview(event) {
    const file = event.target.files[0];
    const newImagePreviewContainer = document.getElementById('new-image-preview-container');
    const newImagePreview = document.getElementById('new-image-preview');
    
    if (file) {
        // Check if file is an image
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                newImagePreview.src = e.target.result;
                newImagePreviewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            // Hide preview if not an image
            newImagePreviewContainer.style.display = 'none';
            showMessage('Please select a valid image file', 'error');
        }
    } else {
        // Hide preview if no file selected
        newImagePreviewContainer.style.display = 'none';
    }
}

function closeImageModal() {
    const imageModal = document.getElementById('image-modal');
    const imageEditForm = document.getElementById('image-edit-form');
    const currentImage = document.getElementById('current-image');
    const currentImageContainer = document.getElementById('current-image-container');
    const newImagePreviewContainer = document.getElementById('new-image-preview-container');
    
    imageModal.classList.add('hidden');
    currentEditingImage = null;
    
    // Reset image display
    currentImage.style.display = 'none';
    currentImage.src = '';
    currentImage.onload = null;
    currentImage.onerror = null;
    currentImageContainer.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>No image selected</p>';
    currentImageContainer.style.display = 'block';
    
    // Hide new image preview
    newImagePreviewContainer.style.display = 'none';
    
    imageEditForm.reset();
}

function handleImageEdit(e) {
    e.preventDefault();
    
    if (!currentEditingImage) return;
    
    const newImageInput = document.getElementById('new-image');
    const imageTitleInput = document.getElementById('image-title');
    const imageDescriptionInput = document.getElementById('image-description');
    
    const newImageFile = newImageInput.files[0];
    const newTitle = imageTitleInput.value.trim();
    const newDescription = imageDescriptionInput.value.trim();
    
    if (!newTitle || !newDescription) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    // Store changes
    if (!changes[currentEditingImage.id]) {
        changes[currentEditingImage.id] = {};
    }
    
    changes[currentEditingImage.id] = {
        ...changes[currentEditingImage.id],
        title: newTitle,
        description: newDescription
    };
    
    if (newImageFile) {
        changes[currentEditingImage.id].newImage = newImageFile;
    }
    
    // Update the image card preview
    updateImageCardPreview(currentEditingImage.id, newTitle, newDescription, newImageFile);
    
    closeImageModal();
    showMessage('Changes saved locally. Click "Save All Changes" to apply to website.', 'success');
}

function updateImageCardPreview(imageId, title, description, imageFile) {
    const imageGrid = document.getElementById('image-grid');
    const card = imageGrid.querySelector(`[onclick="editImage('${imageId}')"]`).closest('.image-card');
    const titleElement = card.querySelector('.image-info p:first-child');
    const descriptionElement = card.querySelector('.image-info p:last-child');
    const imageElement = card.querySelector('.image-preview img');
    
    titleElement.innerHTML = `<strong>Title:</strong> ${title}`;
    descriptionElement.innerHTML = `<strong>Description:</strong> ${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`;
    
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageElement.src = e.target.result;
        };
        reader.readAsDataURL(imageFile);
    }
}

// Save Functions - Updated for Supabase
async function saveAllChanges() {
    console.log('Save all changes called');
    console.log('Current changes:', changes);
    
    if (Object.keys(changes).length === 0) {
        showMessage('No changes to save', 'error');
        return;
    }
    
    showMessage('Saving changes to Supabase...', 'info');
    
    let savedCount = 0;
    let errorCount = 0;
    
    try {
        // Process each change
        for (const imageId of Object.keys(changes)) {
            const change = changes[imageId];
            const content = PAGE_CONTENT[currentPage];
            const image = content.images ? content.images.find(img => img.id === imageId) : null;
            
            if (!image) {
                console.warn(`Image not found for ID: ${imageId}`);
                errorCount++;
                continue;
            }
            
            try {
                let imageUrl = null;
                
                // Upload new image if provided
                if (change.newImage) {
                    console.log(`Uploading new image for ${imageId}...`);
                    // Pass the original image path to maintain directory structure
                    imageUrl = await uploadImageToSupabase(change.newImage, image.currentImage);
                    if (!imageUrl) {
                        throw new Error('Failed to upload image');
                    }
                }
                
                // Determine which API endpoint to use
                const isGalleryItem = currentPage === 'gallery';
                const updateData = {
                    title: change.title || image.currentTitle,
                    description: change.description || image.currentDescription
                };
                
                if (imageUrl) {
                    updateData.image_url = imageUrl;
                }
                
                // Get the Supabase record ID from the image data
                const supabaseId = await getSupabaseIdForImage(image, isGalleryItem);
                if (!supabaseId) {
                    throw new Error('Could not find Supabase record ID');
                }
                
                // Update the record in Supabase
                const apiEndpoint = isGalleryItem 
                    ? getApiUrl(`${CONFIG.ENDPOINTS.GALLERY_IMAGES}/${supabaseId}`)
                    : getApiUrl(`${CONFIG.ENDPOINTS.INDEX_CONTENT}/${supabaseId}`);
                
                console.log(`Updating ${isGalleryItem ? 'gallery image' : 'index content'} with ID: ${supabaseId}`);
                
                const response = await fetch(apiEndpoint, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    console.log(`✅ Updated ${image.currentTitle}`);
                    savedCount++;
                    
                    // Update local data to reflect changes
                    if (change.title) image.currentTitle = change.title;
                    if (change.description) image.currentDescription = change.description;
                    if (imageUrl) image.currentImage = imageUrl;
                } else {
                    throw new Error(result.error || 'Failed to update');
                }
                
            } catch (itemError) {
                console.error(`Failed to save ${image.currentTitle}:`, itemError);
                errorCount++;
            }
        }
        
        // Clear changes after successful save
        changes = {};
        
        // Show result message
        if (savedCount > 0 && errorCount === 0) {
            showMessage(`✅ Successfully saved ${savedCount} changes to Supabase!`, 'success');
        } else if (savedCount > 0 && errorCount > 0) {
            showMessage(`⚠️ Saved ${savedCount} changes, but ${errorCount} failed. Check console for details.`, 'warning');
        } else {
            showMessage(`❌ Failed to save changes. Check console for details.`, 'error');
        }
        
        // Reload page content to reflect changes
        await loadPageContent(currentPage);
        
    } catch (error) {
        console.error('Error in saveAllChanges:', error);
        showMessage('Failed to save changes. Check console for details.', 'error');
    }
}

// Helper function to upload image to Supabase
async function uploadImageToSupabase(imageFile, originalImagePath = null) {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        // Include original path so server knows which directory to use
        if (originalImagePath) {
            formData.append('originalPath', originalImagePath);
        }
        
        const response = await fetch(getApiUrl(CONFIG.ENDPOINTS.UPLOAD_IMAGE), {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Image uploaded to Supabase Storage:', result.image_url);
            return result.image_url;
        } else {
            console.error('Image upload failed:', result.error);
            return null;
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
}

// Helper function to get Supabase record ID for an image
async function getSupabaseIdForImage(image, isGalleryItem) {
    // First check if we have the Supabase ID stored directly
    if (image.supabaseId) {
        console.log(`Using stored Supabase ID for ${image.currentTitle}: ${image.supabaseId}`);
        return image.supabaseId;
    }
    
    // Fallback: search for the ID via API (for backwards compatibility)
    try {
        const apiEndpoint = isGalleryItem 
            ? getApiUrl(CONFIG.ENDPOINTS.GALLERY_IMAGES)
            : getApiUrl(CONFIG.ENDPOINTS.INDEX_CONTENT);
        
        const response = await fetch(apiEndpoint);
        const result = await response.json();
        
        if (result.success) {
            const items = isGalleryItem ? result.images : result.content;
            
            // Try to match by title first, then by current image URL
            let matchedItem = items.find(item => 
                item.title === image.currentTitle || 
                item.image_url === image.currentImage
            );
            
            // If no match found, try partial matching by filename
            if (!matchedItem) {
                const imageFilename = image.currentImage.split('/').pop();
                matchedItem = items.find(item => 
                    item.image_url && item.image_url.includes(imageFilename)
                );
            }
            
            if (matchedItem) {
                console.log(`Found Supabase ID for ${image.currentTitle}: ${matchedItem.id}`);
                // Store the ID for future use
                image.supabaseId = matchedItem.id;
                return matchedItem.id;
            }
        }
        
        console.warn(`Could not find Supabase record for ${image.currentTitle}`);
        return null;
    } catch (error) {
        console.error('Error getting Supabase ID:', error);
        return null;
    }
}

function generateChangesData() {
    const content = PAGE_CONTENT[currentPage];
    const changesData = {
        timestamp: new Date().toISOString(),
        page: currentPage,
        changes: {},
        newImages: [],
        updatedGalleryData: null
    };
    
    // Process all changes
    Object.keys(changes).forEach(imageId => {
        const change = changes[imageId];
        const image = content.images.find(img => img.id === imageId);
        
        if (image) {
            changesData.changes[imageId] = {
                originalImage: image.currentImage,
                originalTitle: image.currentTitle,
                originalDescription: image.currentDescription,
                newTitle: change.title || image.currentTitle,
                newDescription: change.description || image.currentDescription,
                targetFile: image.targetFile,
                targetElements: image.targetElements
            };
            
            // Handle new image uploads
            if (change.newImage) {
                const fileName = image.currentImage.split('/').pop();
                changesData.newImages.push({
                    imageId: imageId,
                    fileName: fileName,
                    originalPath: image.currentImage,
                    targetPath: image.targetFile,
                    fileData: null // Will be filled by Python script
                });
            }
        }
    });
    
    // If this is the gallery page, include updated gallery data
    if (currentPage === 'gallery') {
        changesData.updatedGalleryData = content.images.map(image => {
            const change = changes[image.id];
            return {
                filename: image.currentImage.split('/').pop(),
                title: change && change.title ? change.title : image.currentTitle,
                description: change && change.description ? change.description : image.currentDescription,
                path: image.currentImage
            };
        });
    }
    
    // If this is the index page, include updated index data
    if (currentPage === 'index') {
        changesData.updatedIndexData = content.images.map(image => {
            const change = changes[image.id];
            return {
                filename: image.currentImage.split('/').pop(),
                title: change && change.title ? change.title : image.currentTitle,
                description: change && change.description ? change.description : image.currentDescription,
                path: image.currentImage,
                type: image.isHero ? 'hero' : (image.name === 'Meet the Baker' ? 'about' : 'featured'),
                targetElements: image.targetElements
            };
        });
    }
    
    // If this is the about page, include updated about data
    if (currentPage === 'about') {
        changesData.updatedAboutData = content.images.map(image => {
            const change = changes[image.id];
            return {
                filename: image.currentImage.split('/').pop(),
                title: change && change.title ? change.title : image.currentTitle,
                description: change && change.description ? change.description : image.currentDescription,
                path: image.currentImage,
                type: 'profile',
                targetElements: image.targetElements
            };
        });
    }
    
    // Create downloadable changes file
    const changesBlob = new Blob([JSON.stringify(changesData, null, 2)], { type: 'application/json' });
    const changesUrl = URL.createObjectURL(changesBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = changesUrl;
    downloadLink.download = 'website_changes.json';
    downloadLink.textContent = 'Download Changes File';
    downloadLink.className = 'download-link';
    downloadLink.style.cssText = 'display: block; margin: 10px 0; padding: 10px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; text-align: center;';
    
    // Add download link to message container
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
        messageContainer.appendChild(downloadLink);
        
        // Remove download link after 30 seconds
        setTimeout(() => {
            if (downloadLink.parentNode) {
                downloadLink.parentNode.removeChild(downloadLink);
            }
            URL.revokeObjectURL(changesUrl);
        }, 30000);
    }
    
    // Also generate individual image downloads if any
    handleImageUploads();
    
    // Generate instructions
    generateInstructions();
}

function handleImageUploads() {
    const content = PAGE_CONTENT[currentPage];
    const uploadedFiles = [];
    
    Object.keys(changes).forEach(imageId => {
        const change = changes[imageId];
        const image = content.images.find(img => img.id === imageId);
        
        if (change.newImage && image) {
            const fileName = image.currentImage.split('/').pop();
            uploadedFiles.push({
                file: change.newImage,
                fileName: fileName,
                originalPath: image.currentImage
            });
        }
    });
    
    if (uploadedFiles.length > 0) {
        // Create a zip file with all uploaded images
        createImageDownloadZip(uploadedFiles);
    }
}

function createImageDownloadZip(uploadedFiles) {
    // For simplicity, we'll create individual download links for each image
    // In a real implementation, you'd use a library like JSZip
    
    uploadedFiles.forEach(fileData => {
        const imageUrl = URL.createObjectURL(fileData.file);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = imageUrl;
        downloadLink.download = fileData.fileName;
        downloadLink.textContent = `Download ${fileData.fileName}`;
        downloadLink.className = 'download-link';
        downloadLink.style.cssText = 'display: block; margin: 5px 0; padding: 8px; background: #2196F3; color: white; text-decoration: none; border-radius: 5px; text-align: center;';
        
        // Add download link to message container
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            messageContainer.appendChild(downloadLink);
            
            // Remove download link after 30 seconds
            setTimeout(() => {
                if (downloadLink.parentNode) {
                    downloadLink.parentNode.removeChild(downloadLink);
                }
                URL.revokeObjectURL(imageUrl);
            }, 30000);
        }
    });
}

function generateInstructions() {
    const instructions = `# Instructions for Applying Website Changes

## New Automated Process:

### 1. Download the Changes File
- Click the "Download Changes File" button (green)
- Save the 'website_changes.json' file to your website folder

### 2. Run the Python Script
- Open a terminal/command prompt in your website folder
- Run: python apply_changes.py
- The script will automatically apply all your changes

### 3. Verify Changes
- Open your website in a browser
- Check that titles and descriptions are updated
- Verify that new images are in place

## What the Script Does:
- Updates gallery_data.json with new titles/descriptions
- Replaces image files in the images/gallery/ folder
- Updates HTML pages with new content
- Creates backups of original files

## Manual Process (if needed):
If you prefer to apply changes manually:

1. Download the individual files provided
2. Replace the corresponding files in your website
3. Follow the file-specific instructions

## Troubleshooting:
- Make sure Python is installed on your computer
- Ensure you're running the script from your website folder
- Check that all file paths are correct
- Clear browser cache if changes don't appear

Generated on: ${new Date().toLocaleString()}
`;

    // Create downloadable instructions file
    const instructionsBlob = new Blob([instructions], { type: 'text/plain' });
    const instructionsUrl = URL.createObjectURL(instructionsBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = instructionsUrl;
    downloadLink.download = 'APPLY_CHANGES_INSTRUCTIONS.txt';
    downloadLink.textContent = 'Download Instructions';
    downloadLink.className = 'download-link';
    downloadLink.style.cssText = 'display: block; margin: 10px 0; padding: 10px; background: #9C27B0; color: white; text-decoration: none; border-radius: 5px; text-align: center;';
    
    // Add download link to message container
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
        messageContainer.appendChild(downloadLink);
        
        // Remove download link after 30 seconds
        setTimeout(() => {
            if (downloadLink.parentNode) {
                downloadLink.parentNode.removeChild(downloadLink);
            }
            URL.revokeObjectURL(instructionsUrl);
        }, 30000);
    }
}

// Requests Management Functions
async function loadRequests() {
    const imageGrid = document.getElementById('image-grid');
    
    // Show loading state
    imageGrid.innerHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-pink); margin-bottom: 1rem;"></i>
            <p>Loading cake requests...</p>
        </div>
    `;
    
    const requests = await getRequests();
    
    if (requests.length === 0) {
        imageGrid.innerHTML = `
            <div class="no-requests">
                <i class="fas fa-clipboard-list"></i>
                <p>No cake requests found.</p>
                <p>Submit a request through the website to see it appear here (Sandbox Mode).</p>
            </div>
        `;
        return;
    }
    
    // Default filter: show only pending and in_progress
    const currentFilter = window.__requestsFilter || 'active';
    const filtered = filterRequests(requests, currentFilter);
    
    // Create filter controls
    const filterControls = `
        <div class="requests-controls" style="display:flex;justify-content:flex-end;align-items:center;margin:0.75rem 0;gap:0.5rem;">
            <label for="requests-filter" style="margin-right:0.25rem;font-weight:600;">View:</label>
            <select id="requests-filter" style="padding:0.5rem 0.75rem;border-radius:8px;">
                <option value="all" ${currentFilter==='all'?'selected':''}>View All</option>
                <option value="pending" ${currentFilter==='pending'?'selected':''}>Pending</option>
                <option value="in_progress" ${currentFilter==='in_progress'?'selected':''}>In Progress</option>
                <option value="completed" ${currentFilter==='completed'?'selected':''}>Completed</option>
                <option value="cancelled" ${currentFilter==='cancelled'?'selected':''}>Cancelled</option>
                <option value="active" ${currentFilter==='active'?'selected':''}>Pending + In Progress</option>
            </select>
        </div>`;
    
    const requestsHTML = filtered.map(request => createRequestCard(request)).join('');
    
    imageGrid.innerHTML = `
        <div class="requests-header">
            <div class="request-stats">
                <div class="stat-card">
                    <h4>Pending</h4>
                    <span class="stat-number">${requests.filter(r => r.status === 'pending').length}</span>
                </div>
                <div class="stat-card">
                    <h4>In Progress</h4>
                    <span class="stat-number">${requests.filter(r => r.status === 'in_progress').length}</span>
                </div>
                <div class="stat-card">
                    <h4>Completed</h4>
                    <span class="stat-number">${requests.filter(r => r.status === 'completed').length}</span>
                </div>
            </div>
            ${filterControls}
        </div>
        <div class="requests-grid">
            ${requestsHTML}
        </div>
    `;

    // Bind filter change
    const filterSelect = document.getElementById('requests-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            window.__requestsFilter = e.target.value;
            loadRequests();
        });
    }
}

function filterRequests(requests, filter) {
    switch (filter) {
        case 'all':
            return requests;
        case 'pending':
            return requests.filter(r => r.status === 'pending');
        case 'in_progress':
            return requests.filter(r => r.status === 'in_progress');
        case 'completed':
            return requests.filter(r => r.status === 'completed');
        case 'cancelled':
            return requests.filter(r => r.status === 'cancelled');
        case 'active':
        default:
            // default active view: pending + in_progress
            return requests.filter(r => r.status === 'pending' || r.status === 'in_progress');
    }
}

function createRequestCard(request) {
    const statusColors = {
        pending: '#ffc107',
        in_progress: '#007bff',
        completed: '#28a745',
        cancelled: '#dc3545'
    };
    
    const statusLabels = {
        pending: 'Pending',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled'
    };
    
    const submittedDate = new Date(request.created_at || request.submittedAt).toLocaleDateString();
    const submittedTime = new Date(request.created_at || request.submittedAt).toLocaleTimeString();
    
    // Use database column names (snake_case) as primary, with fallbacks
    const eventDate = request.event_date || request.eventDate || request['date-needed'] || 'Not specified';
    const eventType = request.event_type || request.eventType || request['event-type'] || 'Not specified';
    const cakeSize = request.cake_size || request.cakeSize || request['cake-size'] || 'Not specified';
    const flavor = request.cake_flavor || request.flavor || request['cake-flavor'] || 'Not specified';
    const frosting = request.frosting_type || request.frosting || request['frosting-type'] || 'Not specified';
    const filling = request.cake_filling || request.filling || request['cake-filling'] || 'Not specified';
    const budget = request.budget_range || request.budget || request['budget-range'] || 'Not specified';
    const colorScheme = request.color_scheme || request.colorScheme || request['color-scheme'] || 'Not specified';
    const specialRequests = request.special_requests || request.specialRequests || request['special-requests'] || 'Not specified';
    const requestDelivery = request.request_delivery || request.requestDelivery || request['request-delivery'] || false;
    const eventAddress = request.event_address || request.eventAddress || request['event-address'] || '';
    const eventCity = request.event_city || request.eventCity || request['event-city'] || '';
    const eventZip = request.event_zip || request.eventZip || request['event-zip'] || '';

    return `
        <div class="request-card">
            <div class="request-header">
                <h4>${request.name || 'Unknown Customer'}</h4>
                <span class="status-badge" style="background-color: ${statusColors[request.status]}; color: white;">
                    ${statusLabels[request.status]}
                </span>
            </div>
            <div class="request-content">
                <div class="request-info">
                    <p><strong>Request ID:</strong> ${request.id}</p>
                    <p><strong>Email:</strong> ${request.email || 'Not provided'}</p>
                    <p><strong>Phone:</strong> ${request.phone || 'Not provided'}</p>
                    <p><strong>Event Date:</strong> ${eventDate}</p>
                    <p><strong>Event Type:</strong> ${eventType}</p>
                    <p><strong>Request Delivery:</strong> ${requestDelivery === true || requestDelivery === 'delivery' || requestDelivery === 'yes' ? 'Yes' : 'No'}</p>
                    ${(requestDelivery === true || requestDelivery === 'delivery' || requestDelivery === 'yes') ? `<p><strong>Delivery Address:</strong> ${[eventAddress, eventCity, eventZip].filter(Boolean).join(', ') || 'Not specified'}</p>` : ''}
                    <p><strong>Cake Size:</strong> ${cakeSize}</p>
                    <p><strong>Flavor:</strong> ${flavor}</p>
                    <p><strong>Frosting:</strong> ${frosting}</p>
                    <p><strong>Filling:</strong> ${filling}</p>
                    ${colorScheme !== 'Not specified' ? `<p><strong>Color Scheme:</strong> ${colorScheme}</p>` : ''}
                    ${specialRequests !== 'Not specified' ? `<p><strong>Special Requests:</strong> ${specialRequests}</p>` : ''}
                    <p><strong>Budget:</strong> ${budget}</p>
                    <p><strong>Submitted:</strong> ${submittedDate} at ${submittedTime}</p>
                </div>
                ${(request.design_description || request.description || request['design-description']) ? `
                    <div class="request-description">
                        <h5>Description:</h5>
                        <p>${request.design_description || request.description || request['design-description']}</p>
                    </div>
                ` : ''}
                ${request.additional_notes ? `
                    <div class="request-notes">
                        <h5>Additional Notes:</h5>
                        <p style="white-space: pre-line;">${request.additional_notes}</p>
                    </div>
                ` : ''}
                ${request.reference_image_url ? `
                    <div class="request-image">
                        <h5>Reference Image:</h5>
                        <img src="${request.reference_image_url}" alt="Reference" style="max-width: 200px; max-height: 200px; border-radius: 8px; margin-top: 0.5rem;">
                    </div>
                ` : ''}
                <div class="request-actions">
                    <select onchange="updateRequestStatus('${request.id}', this.value)" class="status-select">
                        <option value="pending" ${request.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="in_progress" ${request.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${request.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${request.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                    <button onclick="deleteRequest('${request.id}')" class="delete-btn">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Utility Functions
function showMessage(message, type = 'success') {
    const messageContainer = document.getElementById('message-container');
    
    if (!messageContainer) {
        console.error('Message container not found');
        // Fallback to alert if message container doesn't exist
        alert(`${type.toUpperCase()}: ${message}`);
        return;
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    messageContainer.appendChild(messageElement);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
} 