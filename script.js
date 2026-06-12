// Prevent Instagram/in-app browser text scaling
document.documentElement.style.webkitTextSizeAdjust = 'none';

// Force correct hero font size using actual pixel width — bypasses Instagram IAB CSS overrides
(function fixHeroSize() {
    function apply() {
        const title = document.querySelector('.hero-title');
        const sub = document.querySelector('.hero-subtitle');
        if (!title) return;
        const w = window.innerWidth;
        if (w <= 768) {
            const titlePx = Math.max(20, Math.min(36, Math.round(w * 0.075)));
            const subPx = Math.max(14, Math.min(20, Math.round(w * 0.042)));
            title.style.setProperty('font-size', titlePx + 'px', 'important');
            if (sub) sub.style.setProperty('font-size', subPx + 'px', 'important');
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', apply);
    } else {
        apply();
    }
    // Re-apply after dynamic content loads (hero text set via JS)
    document.addEventListener('DOMContentLoaded', () => setTimeout(apply, 300));
    window.addEventListener('resize', apply);
}());

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

// Load index page content from local JSON
async function loadIndexContent() {
    try {
        
        const response = await fetch('images/index/index_data.json');
        const data = await response.json();
        const heroItem = data.find(d => d.type === 'hero');
        const featuredItems = data.filter(d => d.type === 'featured');
        const aboutItem = data.find(d => d.type === 'about');

        if (heroItem) {
            const heroTitle = document.querySelector('.hero-title');
            const heroSubtitle = document.querySelector('.hero-subtitle');
            if (heroTitle) heroTitle.textContent = heroItem.title;
            if (heroSubtitle) heroSubtitle.textContent = heroItem.description;
        }

        const cakesGrid = document.querySelector('.cakes-grid');
        if (cakesGrid && featuredItems.length > 0) {
            cakesGrid.innerHTML = featuredItems.map((item, i) => `
                <div class="cake-card fade-in" style="animation-delay:${i * 0.2}s">
                    <div class="cake-image">
                        <img src="${item.path}" alt="${item.title}" loading="lazy">
                    </div>
                    <div class="cake-info">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                    </div>
                </div>
            `).join('');
            window.initializeLightbox();
        }

        if (aboutItem) {
            const aboutTitle = document.querySelector('.about-preview .about-text h2');
            const aboutDesc = document.querySelector('.about-preview .about-text p');
            const aboutImg = document.querySelector('.about-preview .about-image');
            if (aboutTitle) aboutTitle.textContent = aboutItem.title;
            if (aboutDesc) aboutDesc.textContent = aboutItem.description;
            if (aboutImg) {
                const loading = aboutImg.querySelector('.loading');
                const img = document.createElement('img');
                img.src = aboutItem.path;
                img.alt = aboutItem.title;
                img.onload = () => { if (loading) loading.remove(); aboutImg.appendChild(img); };
            }
        }
    } catch (err) {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroTitle) heroTitle.textContent = 'Custom Cakes That Capture Your Sweetest Moments';
        if (heroSubtitle) heroSubtitle.textContent = 'Creatively Delicious';
    }
}

// Load gallery from local JSON
async function loadGalleryContent() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
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

// Load about page content from local JSON
async function loadAboutContent() {
    const aboutImage = document.querySelector('.about-section .about-image');
    const aboutTitle = document.querySelector('.about-section .about-text h2');
    const aboutDesc = document.querySelector('.about-section .about-text p');
    if (!aboutImage) return;
    try {
        const response = await fetch('images/about/about_data.json');
        const data = await response.json();
        const item = data.find(d => d.type === 'profile') || data[0];
        if (!item) throw new Error('No data');
        const loading = aboutImage.querySelector('.loading');
        const img = document.createElement('img');
        img.src = item.path;
        img.alt = item.title;
        img.className = 'fade-in';
        img.onload = () => { if (loading) loading.remove(); aboutImage.appendChild(img); };
        img.onerror = () => { if (loading) loading.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>Unable to load image</p>'; };
        if (aboutTitle && aboutTitle.textContent === 'Loading...') aboutTitle.textContent = item.title;
        if (aboutDesc && aboutDesc.textContent === 'Loading...') aboutDesc.textContent = item.description;
    } catch (err) {
        aboutImage.innerHTML = '<img src="images/about/Nomi.jpg" alt="About the Baker" loading="lazy">';
        if (aboutTitle && aboutTitle.textContent === 'Loading...') aboutTitle.textContent = "Hi, I'm Nomi!";
        if (aboutDesc && aboutDesc.textContent === 'Loading...') aboutDesc.textContent = "Baking has always been my love language.";
    }
}

// Contact form — sends email via /api/send-contact
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const isValid = validateForm(form);
        if (!isValid) {
            const errors = form.__validationErrors || ['Please fill out all required fields.'];
            showInfoModal('Please fix the highlighted fields', errors);
            const firstInvalid = form.__firstInvalidField;
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                try { firstInvalid.focus({ preventScroll: true }); } catch (_) {}
            }
            return;
        }

        const submitBtn = form.querySelector('.submit-button');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(form);
            const body = Object.fromEntries(formData.entries());
            const response = await fetch('/api/send-contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.error || 'Send failed');

            const msg = document.createElement('div');
            msg.className = 'success-message';
            msg.innerHTML = '<i class="fas fa-check-circle"></i> <strong>Message sent!</strong> We\'ll be in touch within 24 hours.';
            form.appendChild(msg);
            form.reset();
            setTimeout(() => msg.remove(), 8000);
        } catch (err) {
            const msg = document.createElement('div');
            msg.className = 'error-message';
            msg.style.cssText = 'background:#fee;color:#c33;padding:1rem;border-radius:var(--border-radius);margin-top:1rem;text-align:center;border:1px solid #fcc;';
            msg.innerHTML = `<i class="fas fa-exclamation-circle"></i> <strong>Couldn't send message.</strong> ${err.message} — Please email us directly at <a href="mailto:nomi@dulcelunacakes.com">nomi@dulcelunacakes.com</a>.`;
            form.appendChild(msg);
            setTimeout(() => msg.remove(), 8000);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
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