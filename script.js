// NBC Video Modal
(function () {
    const badge = document.getElementById('tv-badge');
    const modal = document.getElementById('video-modal');
    const overlay = document.getElementById('video-modal-overlay');
    const closeBtn = document.getElementById('video-modal-close');
    const video = document.getElementById('nbc-video');

    if (!badge || !modal) return;

    function openVideoModal() {
        modal.style.display = 'flex';
        requestAnimationFrame(() => modal.classList.add('active'));
        document.body.style.overflow = 'hidden';
        video.play();
    }

    function closeVideoModal() {
        modal.classList.remove('active');
        video.pause();
        video.currentTime = 0;
        document.body.style.overflow = '';
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }

    badge.addEventListener('click', openVideoModal);
    closeBtn.addEventListener('click', closeVideoModal);
    overlay.addEventListener('click', closeVideoModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeVideoModal();
    });
})();

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
        
        const content = (result.success && result.content) ? result.content : [];

        const heroContent = content.find(item => item.type === 'hero');
        const featuredContent = content.filter(item => item.type === 'featured');
        const aboutContent = content.find(item => item.type === 'about');

        if (heroContent) updateHeroContent(heroContent);
        if (featuredContent.length > 0) updateFeaturedCakes(featuredContent);
        if (aboutContent) updateAboutPreview(aboutContent);

        // Fall back for any section that Supabase didn't provide data for
        if (!heroContent || !featuredContent.length || !aboutContent) {
            loadFallbackContent({ needsHero: !heroContent, needsFeatured: !featuredContent.length, needsAbout: !aboutContent });
        }
    } catch (error) {
        loadFallbackContent({ needsHero: true, needsFeatured: true, needsAbout: true });
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
        
        window.initializeLightbox();
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

function loadFallbackContent({ needsHero = true, needsFeatured = true, needsAbout = true } = {}) {
    
    fetch('images/index/index_data.json')
        .then(response => response.json())
        .then(data => {
            // Process data
            const heroItems = data.filter(d => d.type === 'hero');
            const featuredItems = data.filter(d => d.type === 'featured');
            const aboutItems = data.filter(d => d.type === 'about');
            
            if (needsHero && heroItems.length > 0) {
                const heroTitle = document.querySelector('.hero-title');
                const heroSubtitle = document.querySelector('.hero-subtitle');
                if (heroTitle) heroTitle.textContent = heroItems[0].title;
                if (heroSubtitle) heroSubtitle.textContent = heroItems[0].description;
            }

            if (needsFeatured) {
                const cakesGrid = document.querySelector('.cakes-grid');
                if (cakesGrid && featuredItems.length > 0) {
                    cakesGrid.innerHTML = '';
                    featuredItems.forEach((item, index) => {
                        const cakeCard = document.createElement('div');
                        cakeCard.className = 'cake-card fade-in';
                        cakeCard.style.animationDelay = `${index * 0.2}s`;
                        cakeCard.innerHTML = `
                            <div class="cake-image">
                                <img src="${item.path}" alt="${item.title}" loading="lazy">
                            </div>
                            <div class="cake-info">
                                <h3>${item.title}</h3>
                                <p>${item.description}</p>
                            </div>
                        `;
                        cakesGrid.appendChild(cakeCard);
                    });
                }
            }

            if (needsAbout && aboutItems.length > 0) {
                const aboutImageContainer = document.querySelector('.about-preview .about-image');
                const aboutLoading = aboutImageContainer?.querySelector('.loading');
                if (aboutLoading) {
                    const img = document.createElement('img');
                    img.src = aboutItems[0].path;
                    img.alt = aboutItems[0].title;
                    img.className = 'fade-in';
                    img.onload = () => { aboutLoading.remove(); aboutImageContainer.appendChild(img); };
                }
                const aboutTitle = document.querySelector('.about-preview .about-text h2');
                const aboutDesc = document.querySelector('.about-preview .about-text p');
                if (aboutTitle) aboutTitle.textContent = aboutItems[0].title;
                if (aboutDesc) aboutDesc.textContent = aboutItems[0].description;
            }
        })
        .catch(() => {
            if (needsHero) {
                const heroTitle = document.querySelector('.hero-title');
                const heroSubtitle = document.querySelector('.hero-subtitle');
                if (heroTitle) heroTitle.textContent = "Custom Cakes That Capture Your Sweetest Moments";
                if (heroSubtitle) heroSubtitle.textContent = "Creatively Delicious";
            }
            if (needsFeatured) {
                const cakesGrid = document.querySelector('.cakes-grid');
                if (cakesGrid) cakesGrid.innerHTML = `
                    <div class="cake-card">
                        <div class="cake-image">
                            <img src="images/gallery/ChocolateFloralTier.jpg" alt="Featured Cake" loading="lazy">
                        </div>
                        <div class="cake-info">
                            <h3>Custom Cakes</h3>
                            <p>Beautiful custom cakes for your special occasions</p>
                        </div>
                    </div>`;
            }
            if (needsAbout) {
                const aboutText = document.querySelector('.about-preview .about-text h2');
                const aboutDesc = document.querySelector('.about-preview .about-text p');
                if (aboutText) aboutText.textContent = "Meet the Baker";
                if (aboutDesc) aboutDesc.textContent = "Creating sweet moments with every cake.";
            }
        });
}

// Gallery content loading
async function loadGalleryContent() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return; // Not on gallery page
    
    try {
        console.log('Loading gallery content from Supabase...');
        
        const response = await fetch(getApiUrl(CONFIG.ENDPOINTS.GALLERY_IMAGES));
        const result = await response.json();
        
        const images = (result.success && result.images?.length) ? result.images : null;

        if (images) {
            galleryGrid.innerHTML = images.map(image => `
                <div class="gallery-item" data-title="${image.title}" data-description="${image.description}">
                    <img src="${image.image_url}" alt="${image.title}" loading="lazy">
                    <div class="gallery-caption">
                        <h3>${image.title}</h3>
                        <p>${image.description}</p>
                    </div>
                </div>
            `).join('');
            window.initializeLightbox();
        } else {
            await loadGalleryFallback(galleryGrid);
        }
    } catch (error) {
        await loadGalleryFallback(galleryGrid);
    }
}

async function loadGalleryFallback(galleryGrid) {
    try {
        const response = await fetch('images/gallery/gallery_data.json');
        const data = await response.json();
        galleryGrid.innerHTML = data.map(item => `
            <div class="gallery-item" data-title="${item.title}" data-description="${item.description}">
                <img src="${item.path}" alt="${item.title}" loading="lazy">
                <div class="gallery-caption">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                </div>
            </div>
        `).join('');
        window.initializeLightbox();
    } catch (err) {
        galleryGrid.innerHTML = '<p>Unable to load gallery images. Please try again later.</p>';
    }
}

// About page content loading
async function loadAboutContent() {
    const aboutImage = document.querySelector('.about-section .about-image');
    const aboutTitle = document.querySelector('.about-section .about-text h2');
    const aboutDesc = document.querySelector('.about-section .about-text p');

    if (!aboutImage) return; // Not on about page
    
    try {
        console.log('Loading about content from Supabase...');
        
        const response = await fetch(getApiUrl(CONFIG.ENDPOINTS.INDEX_CONTENT));
        const result = await response.json();
        
        const aboutContent = (result.success && result.content)
            ? result.content.find(item => item.type === 'about')
            : null;

        if (aboutContent) {
            aboutImage.innerHTML = `<img src="${aboutContent.image_url}" alt="${aboutContent.title}" loading="lazy">`;
            if (aboutTitle && aboutTitle.textContent === 'Loading...') aboutTitle.textContent = aboutContent.title;
            if (aboutDesc && aboutDesc.textContent === 'Loading...') aboutDesc.textContent = aboutContent.description;
        } else {
            await loadAboutFallback(aboutImage, aboutTitle, aboutDesc);
        }
    } catch (error) {
        await loadAboutFallback(aboutImage, aboutTitle, aboutDesc);
    }
}

async function loadAboutFallback(aboutImage, aboutTitle, aboutDesc) {
    try {
        const response = await fetch('images/about/about_data.json');
        const data = await response.json();
        const item = data.find(d => d.type === 'profile') || data[0];
        if (!item) throw new Error('No data');

        if (aboutImage) {
            const loading = aboutImage.querySelector('.loading');
            const img = document.createElement('img');
            img.src = item.path;
            img.alt = item.title;
            img.className = 'fade-in';
            img.onload = () => { if (loading) loading.remove(); aboutImage.appendChild(img); };
            img.onerror = () => { if (loading) loading.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>Unable to load image</p>'; };
        }
        if (aboutTitle && aboutTitle.textContent === 'Loading...') aboutTitle.textContent = item.title;
        if (aboutDesc && aboutDesc.textContent === 'Loading...') aboutDesc.textContent = item.description;
    } catch (err) {
        if (aboutImage) aboutImage.innerHTML = '<img src="images/about/Nomi.jpg" alt="About the Baker" loading="lazy">';
        if (aboutTitle && aboutTitle.textContent === 'Loading...') aboutTitle.textContent = "Hi, I'm Nomi!";
        if (aboutDesc && aboutDesc.textContent === 'Loading...') aboutDesc.textContent = "Baking has always been my love language.";
    }
}

// Make SANDBOX_MODE available globally for admin panel
window.SANDBOX_MODE = SANDBOX_MODE;

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
    window.initializeLightbox();
});

// Reinitialize click handlers for dynamically loaded gallery items and cake cards
window.initializeLightbox = function() {
    function bindModalClick(trigger, getSrc, getTitle, getDescription) {
        if (!trigger) return;
        if (trigger._modalClickHandler) {
            trigger.removeEventListener('click', trigger._modalClickHandler);
        }
        const handler = () => {
            if (window.openImageModal) {
                window.openImageModal(getSrc(), getTitle(), getDescription());
            }
        };
        trigger._modalClickHandler = handler;
        trigger.addEventListener('click', handler);
    }

    document.querySelectorAll('.gallery-item').forEach(item => {
        const img = item.querySelector('img');
        const caption = item.querySelector('.gallery-caption');
        if (!img) return;
        const getSrc = () => img.src;
        const getTitle = () => caption?.querySelector('h3')?.textContent || img.alt;
        const getDescription = () => caption?.querySelector('p')?.textContent || '';
        bindModalClick(img, getSrc, getTitle, getDescription);
        bindModalClick(caption, getSrc, getTitle, getDescription);
    });

    document.querySelectorAll('.cake-card').forEach(card => {
        const img = card.querySelector('.cake-image img');
        const info = card.querySelector('.cake-info');
        if (!img) return;
        const getSrc = () => img.src;
        const getTitle = () => info?.querySelector('h3')?.textContent || img.alt;
        const getDescription = () => info?.querySelector('p')?.textContent || '';
        bindModalClick(img, getSrc, getTitle, getDescription);
        bindModalClick(info, getSrc, getTitle, getDescription);
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

// Fade in page on load
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
}); 