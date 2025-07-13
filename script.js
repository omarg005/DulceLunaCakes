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

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });

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

// Handle form submissions
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (validateForm(form)) {
                // Show loading state
                const submitBtn = form.querySelector('.submit-button');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
                submitBtn.disabled = true;
                
                try {
                    // Create FormData for file upload
                    const formData = new FormData(form);
                    
                    // Submit to server (using relative URL for production deployment)
                    const response = await fetch('/api/submit-request', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        // Show success message
                        const successMsg = document.createElement('div');
                        successMsg.className = 'success-message';
                        successMsg.innerHTML = `
                            <i class="fas fa-check-circle"></i>
                            <div>
                                <strong>Thank you! Your request has been submitted successfully!</strong><br>
                                Request ID: ${result.submissionId}<br>
                                We'll review your request and contact you within 24 hours.
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
            }
        });
    });
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