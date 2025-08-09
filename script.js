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
const SANDBOX_MODE = true; // Change to false for production

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
                        const formData = new FormData(form);
                        
                        const response = await fetch('/api/submit-request', {
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

// Image lightbox functionality for gallery
function createLightbox() {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <img src="" alt="" class="lightbox-image">
            <div class="lightbox-caption"></div>
            <button class="lightbox-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(lightbox);
    
    // Close lightbox
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
            lightbox.classList.remove('active');
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
        }
    });
    
    return lightbox;
}

// Lightbox styles are now defined in styles.css

// Initialize lightbox for gallery images
document.addEventListener('DOMContentLoaded', () => {
    const lightbox = createLightbox();
    const galleryImages = document.querySelectorAll('.gallery-item img');
    
    galleryImages.forEach(img => {
        img.addEventListener('click', () => {
            const lightboxImg = lightbox.querySelector('.lightbox-image');
            const lightboxCaption = lightbox.querySelector('.lightbox-caption');
            
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxCaption.textContent = img.alt;
            
            lightbox.classList.add('active');
        });
    });
});

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