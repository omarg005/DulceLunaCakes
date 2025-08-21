// Mobile Navigation Toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Scroll to Top Button
const scrollTopBtn = document.getElementById('scroll-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header background on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(254, 254, 254, 0.98)';
    } else {
        header.style.background = 'rgba(254, 254, 254, 0.95)';
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.cake-card, .about-content, .social-icon');
    animateElements.forEach(el => {
        observer.observe(el);
    });
});

// Form validation and submission (for request form)
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    const errors = [];
    let firstInvalidField = null;

    requiredFields.forEach(field => {
        const value = (field.value || '').trim();
        if (!value) {
            field.classList.add('error');
            if (!firstInvalidField) firstInvalidField = field;
            const label = (field.closest('.form-group')?.querySelector('label')?.innerText || field.name || 'This field').replace(/\s*\*$/, '');
            errors.push(`${label} is required`);
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });

    // Conditional validation for delivery fields on request form
    try {
        const deliverySelect = form.querySelector('#request-delivery');
        if (deliverySelect && deliverySelect.value === 'yes') {
            const addressField = form.querySelector('#event-address');
            const cityField = form.querySelector('#event-city');
            const zipField = form.querySelector('#event-zip');

            const deliveryFields = [addressField, cityField, zipField];
            deliveryFields.forEach(field => {
                if (field) {
                    const value = (field.value || '').trim();
                    if (!value) {
                        field.classList.add('error');
                        if (!firstInvalidField) firstInvalidField = field;
                        const label = (field.closest('.form-group')?.querySelector('label')?.innerText || field.name || 'This field').replace(/\s*\*$/, '');
                        errors.push(`${label} is required when Request Delivery is Yes`);
                        isValid = false;
                    } else {
                        field.classList.remove('error');
                    }
                }
            });
        }
    } catch (err) {
        console.warn('Conditional delivery validation skipped:', err);
    }

    // Expose errors and first invalid field to submit handler
    form.__validationErrors = errors;
    form.__firstInvalidField = firstInvalidField;

    return isValid;
}

// Add form validation styles
const style = document.createElement('style');
style.textContent = `
    .form-group input.error,
    .form-group textarea.error,
    .form-group select.error {
        border-color: #ff6b6b;
        box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
    }
    
    .error-message {
        color: #ff6b6b;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
    
    .success-message {
        background: var(--accent-mint);
        color: var(--text-dark);
        padding: 1rem;
        border-radius: var(--border-radius);
        margin-top: 1rem;
        text-align: center;
        font-weight: 500;
    }
`;
document.head.appendChild(style);

// Simple informational modal for validation errors
function showInfoModal(title, messages) {
    const existing = document.getElementById('info-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'info-modal';

    const content = document.createElement('div');
    content.className = 'modal-content';

    const header = document.createElement('div');
    header.className = 'modal-header';

    const h3 = document.createElement('h3');
    h3.textContent = title || 'Please review and correct the following';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '&times;';

    header.appendChild(h3);
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    const list = document.createElement('ul');
    list.style.paddingLeft = '1.2rem';
    list.style.margin = '0 0 0.5rem 0';

    const msgs = Array.isArray(messages) ? messages : [String(messages || 'Unknown error')];
    msgs.slice(0, 10).forEach(msg => {
        const li = document.createElement('li');
        li.textContent = msg;
        list.appendChild(li);
    });
    body.appendChild(list);

    content.appendChild(header);
    content.appendChild(body);
    modal.appendChild(content);
    document.body.appendChild(modal);

    function close() { modal.remove(); }
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    // Show modal
    modal.style.display = 'flex';
}

// Configuration - Set to true for sandbox mode (testing)
const SANDBOX_MODE = false; // Change to false for production

// Dynamic content loading from Supabase
async function loadIndexContent() {
    try {
        console.log('Loading index content from Supabase...');
        
        const response = await fetch(getApiUrl(CONFIG.ENDPOINTS.INDEX_CONTENT));
        const result = await response.json();
        
        if (result.success && result.content) {
            // Load hero content
            const heroContent = result.content.find(item => item.type === 'hero');
            if (heroContent) {
                updateHeroContent(heroContent);
            }
            
            // Load featured cakes
            const featuredContent = result.content.filter(item => item.type === 'featured');
            if (featuredContent.length > 0) {
                updateFeaturedCakes(featuredContent);
            }
            
            // Load about preview
            const aboutContent = result.content.find(item => item.type === 'about');
            if (aboutContent) {
                updateAboutPreview(aboutContent);
            }
            
            console.log('✅ Index content loaded from Supabase');
        } else {
            console.warn('Failed to load from Supabase, using fallback');
            loadFallbackContent();
        }
    } catch (error) {
        console.error('Error loading index content:', error);
        loadFallbackContent();
    }
}

function updateHeroContent(heroContent) {
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        // Update background image
        heroSection.style.backgroundImage = `url('${heroContent.image_url}')`;
        
        // Update title and subtitle
        const title = heroSection.querySelector('.hero-title');
        const subtitle = heroSection.querySelector('.hero-subtitle');
        
        if (title) title.textContent = heroContent.title;
        if (subtitle) subtitle.textContent = heroContent.description;
    }
}

function updateFeaturedCakes(featuredContent) {
    const cakesGrid = document.querySelector('.cakes-grid');
    if (cakesGrid) {
        cakesGrid.innerHTML = featuredContent.map(cake => `
            <div class="cake-card" data-title="${cake.title}" data-description="${cake.description}">
                <div class="cake-image">
                    <img src="${cake.image_url}" alt="${cake.title}" loading="lazy">
                </div>
                <div class="cake-info">
                    <h3>${cake.title}</h3>
                    <p>${cake.description}</p>
                </div>
            </div>
        `).join('');
        
        // Re-initialize image modal for new content
        initializeImageModal();
    }
}

function updateAboutPreview(aboutContent) {
    const aboutText = document.querySelector('.about-preview .about-text h2');
    const aboutDesc = document.querySelector('.about-preview .about-text p');
    const aboutImageContainer = document.querySelector('.about-preview .about-image');
    
    if (aboutText) aboutText.textContent = aboutContent.title;
    if (aboutDesc) aboutDesc.textContent = aboutContent.description;
    
    if (aboutImageContainer) {
        aboutImageContainer.innerHTML = `
            <img src="${aboutContent.image_url}" alt="${aboutContent.title}" loading="lazy">
        `;
    }
}

function loadFallbackContent() {
    // Fallback content when Supabase fails
    const cakesGrid = document.querySelector('.cakes-grid');
    const aboutText = document.querySelector('.about-preview .about-text h2');
    const aboutDesc = document.querySelector('.about-preview .about-text p');
    
    if (cakesGrid) {
        cakesGrid.innerHTML = `
            <div class="cake-card">
                <div class="cake-image">
                    <img src="images/gallery/ChocolateFloralTier.jpg" alt="Featured Cake" loading="lazy">
                </div>
                <div class="cake-info">
                    <h3>Custom Cakes</h3>
                    <p>Beautiful custom cakes for your special occasions</p>
                </div>
            </div>
        `;
    }
    
    if (aboutText) aboutText.textContent = "Meet the Baker";
    if (aboutDesc) aboutDesc.textContent = "Creating sweet moments with every cake.";
}

// Gallery content loading
async function loadGalleryContent() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return; // Not on gallery page
    
    try {
        console.log('Loading gallery content from Supabase...');
        
        const response = await fetch(getApiUrl(CONFIG.ENDPOINTS.GALLERY_IMAGES));
        const result = await response.json();
        
        if (result.success && result.images) {
            galleryGrid.innerHTML = result.images.map(image => `
                <div class="gallery-item" data-title="${image.title}" data-description="${image.description}">
                    <img src="${image.image_url}" alt="${image.title}" loading="lazy">
                    <div class="gallery-caption">
                        <h3>${image.title}</h3>
                        <p>${image.description}</p>
                    </div>
                </div>
            `).join('');
            
            // Re-initialize image modal for gallery
            initializeImageModal();
            
            console.log('✅ Gallery content loaded from Supabase');
        } else {
            console.warn('Failed to load gallery from Supabase');
        }
    } catch (error) {
        console.error('Error loading gallery content:', error);
    }
}

// About page content loading
async function loadAboutContent() {
    const aboutImage = document.querySelector('.about-image');
    const aboutTitle = document.querySelector('.about-text h2');
    const aboutDesc = document.querySelector('.about-text p');
    
    if (!aboutImage) return; // Not on about page
    
    try {
        console.log('Loading about content from Supabase...');
        
        const response = await fetch(getApiUrl(CONFIG.ENDPOINTS.INDEX_CONTENT));
        const result = await response.json();
        
        if (result.success && result.content) {
            const aboutContent = result.content.find(item => item.type === 'about');
            if (aboutContent) {
                // Update image
                aboutImage.innerHTML = `
                    <img src="${aboutContent.image_url}" alt="${aboutContent.title}" loading="lazy">
                `;
                
                // Update title (only if it's still "Loading...")
                if (aboutTitle && aboutTitle.textContent === 'Loading...') {
                    aboutTitle.textContent = aboutContent.title;
                }
                
                // Update first paragraph (only if it's still "Loading...")
                if (aboutDesc && aboutDesc.textContent === 'Loading...') {
                    aboutDesc.textContent = aboutContent.description;
                }
                
                console.log('✅ About content loaded from Supabase');
            }
        }
    } catch (error) {
        console.error('Error loading about content:', error);
        
        // Fallback content
        if (aboutImage) {
            aboutImage.innerHTML = `
                <img src="images/about/Nomi.jpg" alt="About the Baker" loading="lazy">
            `;
        }
        if (aboutTitle && aboutTitle.textContent === 'Loading...') {
            aboutTitle.textContent = "Hi, I'm Nomi!";
        }
        if (aboutDesc && aboutDesc.textContent === 'Loading...') {
            aboutDesc.textContent = "Baking has always been my love language.";
        }
    }
}

// Make SANDBOX_MODE available globally for admin panel
window.SANDBOX_MODE = SANDBOX_MODE;

// Debug: Log sandbox mode on page load
console.log('Script loaded. SANDBOX_MODE:', SANDBOX_MODE);
console.log('Current timestamp:', new Date().toISOString());
console.log('Script version: 2025-07-13-17:12');

// Test if script is running
window.testSandboxMode = function() {
    console.log('Manual test - SANDBOX_MODE:', SANDBOX_MODE);
    console.log('Manual test - localStorage test:', localStorage.getItem('test') || 'undefined');
    localStorage.setItem('test', 'working');
    console.log('Manual test - localStorage after set:', localStorage.getItem('test'));
};

// Sandbox storage functions
function saveSandboxRequest(requestData) {
    try {
        const requests = JSON.parse(localStorage.getItem('sandboxRequests') || '[]');
        const requestId = 'REQ-' + Date.now();
        const fullRequest = {
            id: requestId,
            ...requestData,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        requests.push(fullRequest);
        localStorage.setItem('sandboxRequests', JSON.stringify(requests));
        console.log('Successfully saved request to localStorage');
        return requestId;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        throw new Error('Failed to save request locally: ' + error.message);
    }
}

function getSandboxRequests() {
    return JSON.parse(localStorage.getItem('sandboxRequests') || '[]');
}

// Handle form submissions
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('.cake-request-form, .contact-form');
    console.log('Found forms:', forms.length);
    
    forms.forEach((form, index) => {
        console.log(`Setting up form ${index}:`, form.className);
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submitted:', form.className);
            
            try {
                const isValid = validateForm(form);
                if (isValid) {
                    console.log('Form validation passed');
                    // Show loading state
                    const submitBtn = form.querySelector('.submit-button');
                    const originalText = submitBtn.innerHTML;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
                    submitBtn.disabled = true;
                    
                    try {
                    let result;
                    
                    console.log('SANDBOX_MODE:', SANDBOX_MODE);
                    
                    if (SANDBOX_MODE) {
                        console.log('Entering sandbox mode');
                        // Sandbox mode - store locally and simulate success
                        const formData = new FormData(form);
                        const requestData = {};
                        
                        console.log('Converting FormData to object');
                        // Convert FormData to object (normalize keys to camelCase-like names too)
                        for (let [key, value] of formData.entries()) {
                            if (requestData[key]) {
                                // Handle multiple values (like checkboxes)
                                if (Array.isArray(requestData[key])) {
                                    requestData[key].push(value);
                                } else {
                                    requestData[key] = [requestData[key], value];
                                }
                            } else {
                                requestData[key] = value;
                            }

                            // Also mirror some fields with friendlier keys for admin display
                            const map = {
                                'date-needed': 'eventDate',
                                'event-type': 'eventType',
                                'event-address': 'eventAddress',
                                'event-city': 'eventCity',
                                'event-zip': 'eventZip',
                                'cake-size': 'cakeSize',
                                'cake-flavor': 'flavor',
                                'frosting-type': 'frosting',
                                'cake-filling': 'filling',
                                'budget-range': 'budget',
                                'design-description': 'description',
                                'request-delivery': 'requestDelivery'
                            };
                            if (map[key]) {
                                requestData[map[key]] = value;
                            }
                        }
                        
                        console.log('RequestData:', requestData);
                        
                        // Save to local storage
                        console.log('Saving to localStorage');
                        const requestId = saveSandboxRequest(requestData);
                        console.log('Saved with ID:', requestId);
                        
                        // Simulate success
                        result = {
                            success: true,
                            submissionId: requestId,
                            mode: 'sandbox'
                        };
                        console.log('Sandbox result:', result);
                    } else {
                        // Production mode - submit to server
                        console.log('🚀 Production mode - submitting to server');
                        console.log('🔧 CONFIG check:', typeof CONFIG !== 'undefined' ? CONFIG : 'CONFIG not defined');
                        console.log('🔧 getApiUrl check:', typeof getApiUrl !== 'undefined' ? 'Available' : 'Not available');
                        
                        // Fallback CONFIG definition if not loaded
                        if (typeof CONFIG === 'undefined') {
                            console.warn('⚠️ CONFIG not found, creating fallback...');
                            window.CONFIG = {
                                API_BASE_URL: window.location.origin,
                                ENDPOINTS: {
                                    SUBMIT_REQUEST: '/api/submit-request'
                                }
                            };
                        }
                        
                        if (typeof getApiUrl === 'undefined') {
                            console.warn('⚠️ getApiUrl not found, creating fallback...');
                            window.getApiUrl = function(endpoint) {
                                return (CONFIG.API_BASE_URL || window.location.origin) + endpoint;
                            };
                        }
                        
                        const apiUrl = getApiUrl(CONFIG.ENDPOINTS.SUBMIT_REQUEST);
                        console.log('📡 API URL:', apiUrl);
                        
                        const formData = new FormData(form);
                        
                        const response = await fetch(apiUrl, {
                            method: 'POST',
                            body: formData
                        });
                        
                        result = await response.json();
                    }
                    
                    if (result.success) {
                        // Show success message
                        const successMsg = document.createElement('div');
                        successMsg.className = 'success-message';
                        successMsg.innerHTML = `
                            <i class="fas fa-check-circle"></i>
                            <div>
                                <strong>Thank you! Your request has been submitted successfully!</strong><br>
                                Request ID: ${result.submissionId}<br>
                                ${result.mode === 'sandbox' ? 
                                    '<em>Note: Running in sandbox mode - no emails sent</em><br>' : 
                                    'We\'ll review your request and contact you within 24 hours.'
                                }
                            </div>
                        `;
                        
                        form.appendChild(successMsg);
                        form.reset();
                        
                        // Remove success message after 8 seconds
                        setTimeout(() => {
                            successMsg.remove();
                        }, 8000);
                    } else {
                        throw new Error(result.message || 'Submission failed');
                    }
                    
                } catch (error) {
                    console.error('Error submitting form:', error);
                    console.error('Error details:', {
                        message: error.message,
                        name: error.name,
                        stack: error.stack
                    });
                    
                    // Show user-friendly error message
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'error-message';
                    errorMsg.style.cssText = `
                        background: #fee;
                        color: #c33;
                        padding: 1rem;
                        border-radius: var(--border-radius);
                        margin-top: 1rem;
                        text-align: center;
                        border: 1px solid #fcc;
                    `;
                    
                    // Check if it's a network error (server not available)
                    if (error.message.includes('fetch') || error.name === 'TypeError') {
                        errorMsg.innerHTML = `
                            <i class="fas fa-exclamation-circle"></i>
                            <strong>Server temporarily unavailable</strong><br>
                            Please contact us directly at <a href="mailto:hello@dulcelunacakes.com">hello@dulcelunacakes.com</a> or call <a href="tel:+15551234567">(555) 123-4567</a>.
                        `;
                    } else {
                        errorMsg.innerHTML = `
                            <i class="fas fa-exclamation-circle"></i>
                            <strong>Error submitting request:</strong> ${error.message}<br>
                            Please try again or contact us directly.
                        `;
                    }
                    
                    form.appendChild(errorMsg);
                    
                    // Remove error message after 8 seconds
                    setTimeout(() => {
                        errorMsg.remove();
                    }, 8000);
                } finally {
                    // Reset button
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            } else {
                const errors = form.__validationErrors || ['Please fill out all required fields.'];
                showInfoModal('Please fix the highlighted fields', errors);
                const firstInvalid = form.__firstInvalidField;
                if (firstInvalid && typeof firstInvalid.scrollIntoView === 'function') {
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    try { firstInvalid.focus({ preventScroll: true }); } catch (_) {}
                }
                return;
            }
            } catch (outerError) {
                console.error('Outer form submission error:', outerError);
                // Show a generic error message
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.style.cssText = `
                    background: #fee;
                    color: #c33;
                    padding: 1rem;
                    border-radius: var(--border-radius);
                    margin-top: 1rem;
                    text-align: center;
                    border: 1px solid #fcc;
                `;
                errorMsg.innerHTML = `
                    <i class="fas fa-exclamation-circle"></i>
                    <strong>Unexpected error:</strong> ${outerError.message}<br>
                    Please try again or contact us directly.
                `;
                form.appendChild(errorMsg);
                
                // Remove error message after 8 seconds
                setTimeout(() => {
                    errorMsg.remove();
                }, 8000);
            }
        });
    });
});

// Toggle delivery fields visibility on request page
document.addEventListener('DOMContentLoaded', () => {
    const deliverySelect = document.getElementById('request-delivery');
    const deliveryFields = document.getElementById('delivery-fields');
    if (!deliverySelect || !deliveryFields) {
        return;
    }

    function updateDeliveryVisibility() {
        const shouldShow = deliverySelect.value === 'yes';
        if (shouldShow) {
            deliveryFields.classList.remove('hidden');
        } else {
            deliveryFields.classList.add('hidden');
        }
    }

    // Initialize and bind change handler
    updateDeliveryVisibility();
    deliverySelect.addEventListener('change', updateDeliveryVisibility);
});

// Enhanced Image Modal functionality
function initializeImageModal() {
    const modal = document.getElementById('image-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    
    if (!modal) return; // Modal not found on this page
    
    // Function to open modal with image data
    function openModal(imageSrc, title, description) {
        modalImage.src = imageSrc;
        modalImage.alt = title;
        modalTitle.textContent = title;
        modalDescription.textContent = description;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    // Function to close modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        
        // Clear modal content after animation
        setTimeout(() => {
            modalImage.src = '';
            modalTitle.textContent = '';
            modalDescription.textContent = '';
        }, 300);
    }
    
    // Close modal event listeners
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Return the openModal function for external use
    window.openImageModal = openModal;
}

// Initialize modal when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Load dynamic content from Supabase
    await loadIndexContent();
    await loadGalleryContent();
    await loadAboutContent();
    
    // Initialize modal after content is loaded
    initializeImageModal();
    
    // Setup click handlers for gallery items (for gallery page)
    setTimeout(() => {
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            const img = item.querySelector('img');
            const caption = item.querySelector('.gallery-caption');
            
            if (img) {
                // Create a single click handler function
                const openGalleryModal = () => {
                    const title = caption ? caption.querySelector('h3')?.textContent || img.alt : img.alt;
                    const description = caption ? caption.querySelector('p')?.textContent || '' : '';
                    
                    if (window.openImageModal) {
                        window.openImageModal(img.src, title, description);
                    }
                };
                
                // Add click handlers to both image and caption
                img.addEventListener('click', openGalleryModal);
                if (caption) {
                    caption.addEventListener('click', openGalleryModal);
                }
            }
        });
    }, 100); // Small delay to ensure images are loaded
    
    // Setup click handlers for cake cards (for index page)
    setTimeout(() => {
        const cakeCards = document.querySelectorAll('.cake-card');
        cakeCards.forEach(card => {
            const img = card.querySelector('.cake-image img');
            const cakeInfo = card.querySelector('.cake-info');
            
            if (img) {
                // Create a single click handler function
                const openCakeModal = () => {
                    const title = cakeInfo ? cakeInfo.querySelector('h3')?.textContent || img.alt : img.alt;
                    const description = cakeInfo ? cakeInfo.querySelector('p')?.textContent || '' : '';
                    
                    if (window.openImageModal) {
                        window.openImageModal(img.src, title, description);
                    }
                };
                
                // Add click handlers to both image and cake info
                img.addEventListener('click', openCakeModal);
                if (cakeInfo) {
                    cakeInfo.addEventListener('click', openCakeModal);
                }
            }
        });
    }, 100); // Small delay to ensure images are loaded
    
    // Make images and descriptions clickable by adding cursor pointer
    const style = document.createElement('style');
    style.textContent = `
        .cake-card .cake-image img,
        .gallery-item img,
        .cake-info,
        .gallery-caption {
            cursor: pointer;
        }
        
        .cake-card .cake-image img:hover,
        .gallery-item img:hover {
            opacity: 0.9;
        }
        
        .cake-info:hover h3,
        .cake-info:hover p {
            color: var(--primary-pink) !important;
        }
    `;
    document.head.appendChild(style);
});

// Global function to reinitialize modal for dynamically loaded content
window.initializeLightbox = function() {
    // Re-setup click handlers for dynamically loaded gallery items
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        const caption = item.querySelector('.gallery-caption');
        
        if (img) {
            // Remove existing listeners to prevent duplicates
            if (img._modalClickHandler) {
                img.removeEventListener('click', img._modalClickHandler);
            }
            if (caption && caption._modalClickHandler) {
                caption.removeEventListener('click', caption._modalClickHandler);
            }
            
            // Create new handler
            const openGalleryModal = () => {
                const title = caption ? caption.querySelector('h3')?.textContent || img.alt : img.alt;
                const description = caption ? caption.querySelector('p')?.textContent || '' : '';
                
                if (window.openImageModal) {
                    window.openImageModal(img.src, title, description);
                }
            };
            
            // Store references for cleanup
            img._modalClickHandler = openGalleryModal;
            if (caption) {
                caption._modalClickHandler = openGalleryModal;
            }
            
            // Add event listeners
            img.addEventListener('click', openGalleryModal);
            if (caption) {
                caption.addEventListener('click', openGalleryModal);
            }
        }
    });
};

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add loading styles
const loadingStyle = document.createElement('style');
loadingStyle.textContent = `
    body {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    
    body.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(loadingStyle); 