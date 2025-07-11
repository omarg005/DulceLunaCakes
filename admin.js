// Admin Panel JavaScript

// Configuration
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'dulceluna2025' // Change this to a secure password
};

// Page content configuration
const PAGE_CONTENT = {
    index: {
        title: 'Home Page Content',
        images: [
            {
                id: 'hero-background',
                name: 'Hero Background',
                currentImage: 'images/index/Hero.avif',
                currentTitle: 'Custom Cakes That Capture Your Sweetest Moments',
                currentDescription: 'Where edible art meets your celebration',
                targetFile: 'images/index/Hero.avif',
                targetElements: {
                    image: '.hero::before',
                    title: '.hero-title',
                    description: '.hero-subtitle'
                },
                isHero: true
            },
            {
                id: 'chocolate-floral-tier',
                name: 'Chocolate Floral Tier',
                currentImage: 'images/index/ChocolateFloralTier.avif',
                currentTitle: 'Chocolate Floral Tier',
                currentDescription: 'A stunning three-tier chocolate cake adorned with delicate sugar flowers',
                targetFile: 'images/index/ChocolateFloralTier.avif',
                targetElements: {
                    image: '.cake-card:nth-child(1) img',
                    title: '.cake-card:nth-child(1) h3',
                    description: '.cake-card:nth-child(1) p'
                }
            },
            {
                id: 'unicorn-birthday-magic',
                name: 'Unicorn Birthday Magic',
                currentImage: 'images/index/UnicornBirthdayMagic.avif',
                currentTitle: 'Unicorn Birthday Magic',
                currentDescription: 'Colorful layers with rainbow frosting and magical unicorn decorations',
                targetFile: 'images/index/UnicornBirthdayMagic.avif',
                targetElements: {
                    image: '.cake-card:nth-child(2) img',
                    title: '.cake-card:nth-child(2) h3',
                    description: '.cake-card:nth-child(2) p'
                }
            },
            {
                id: 'rustic-wedding-cake',
                name: 'Rustic Wedding Cake',
                currentImage: 'images/index/RusticWeddingCake.avif',
                currentTitle: 'Rustic Wedding Cake',
                currentDescription: 'Elegant naked cake with fresh flowers and rustic charm',
                targetFile: 'images/index/RusticWeddingCake.avif',
                targetElements: {
                    image: '.cake-card:nth-child(3) img',
                    title: '.cake-card:nth-child(3) h3',
                    description: '.cake-card:nth-child(3) p'
                }
            },
            {
                id: 'meet-the-baker',
                name: 'Meet the Baker',
                currentImage: 'images/index/MeetTheBaker.avif',
                currentTitle: 'Meet the Baker',
                currentDescription: 'Hi, I\'m Luna! Baking has always been my love language.',
                targetFile: 'images/index/MeetTheBaker.avif',
                targetElements: {
                    image: '.about-image img',
                    title: '.about-text h2',
                    description: '.about-text p'
                }
            }
        ]
    },
    about: {
        title: 'About Page Content',
        images: [
            {
                id: 'hi-im-luna',
                name: 'Hi, I\'m Luna',
                currentImage: 'images/about/HiImLuna.avif',
                currentTitle: 'Hi, I\'m Luna!',
                currentDescription: 'Baking has always been my love language. From the moment I first mixed flour and sugar in my grandmother\'s kitchen, I knew that creating sweet moments through cake was my calling.',
                targetFile: 'images/about/HiImLuna.avif',
                targetElements: {
                    image: '.about-image img',
                    title: '.about-text h2',
                    description: '.about-text p'
                }
            }
        ]
    },
    gallery: {
        title: 'Gallery Content',
        images: [
            {
                id: 'gallery-1',
                name: 'Gallery Image 1',
                currentImage: 'images/gallery/gallery1.avif',
                currentTitle: 'Gallery Image 1',
                currentDescription: 'Beautiful cake creation',
                targetFile: 'images/gallery/gallery1.avif',
                targetElements: {
                    image: '.gallery-item:nth-child(1) img',
                    title: '.gallery-item:nth-child(1) h3',
                    description: '.gallery-item:nth-child(1) p'
                }
            }
            // Add more gallery images as needed
        ]
    }
};

// Global variables
let currentPage = 'index';
let currentEditingImage = null;
let changes = {};

// DOM Elements
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

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showDashboard();
    }
    
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Page tabs
    pageTabs.forEach(tab => {
        tab.addEventListener('click', () => switchPage(tab.dataset.page));
    });
    
    // Modal controls
    closeModal.addEventListener('click', closeImageModal);
    cancelEdit.addEventListener('click', closeImageModal);
    
    // Image edit form
    imageEditForm.addEventListener('submit', handleImageEdit);
    
    // Save all changes
    saveAllBtn.addEventListener('click', saveAllChanges);
    
    // Close modal on outside click
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            closeImageModal();
        }
    });
});

// Authentication Functions
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
        showMessage('Login successful!', 'success');
    } else {
        showLoginError('Invalid username or password');
    }
}

function handleLogout() {
    localStorage.removeItem('adminLoggedIn');
    showLoginScreen();
    showMessage('Logged out successfully', 'success');
}

function showLoginScreen() {
    loginScreen.classList.remove('hidden');
    adminDashboard.classList.add('hidden');
    loginForm.reset();
    loginError.classList.add('hidden');
}

function showDashboard() {
    loginScreen.classList.add('hidden');
    adminDashboard.classList.remove('hidden');
    loadPageContent(currentPage);
}

function showLoginError(message) {
    loginError.textContent = message;
    loginError.classList.remove('hidden');
}

// Page Management Functions
function switchPage(page) {
    currentPage = page;
    
    // Update active tab
    pageTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.page === page);
    });
    
    // Load page content
    loadPageContent(page);
}

function loadPageContent(page) {
    const content = PAGE_CONTENT[page];
    if (!content) return;
    
    pageTitle.textContent = content.title;
    renderImageGrid(content.images);
}

function renderImageGrid(images) {
    imageGrid.innerHTML = '';
    
    images.forEach(image => {
        const imageCard = createImageCard(image);
        imageGrid.appendChild(imageCard);
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
                <img src="${image.currentImage}" alt="${image.currentTitle}" onerror="this.parentElement.innerHTML='<div class=\'placeholder\'>Image not found</div>'">
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
    currentImage.src = image.currentImage;
    imageTitleInput.value = image.currentTitle;
    imageDescriptionInput.value = image.currentDescription;
    
    // Show modal
    imageModal.classList.remove('hidden');
}

function closeImageModal() {
    imageModal.classList.add('hidden');
    currentEditingImage = null;
    imageEditForm.reset();
}

async function handleImageEdit(e) {
    e.preventDefault();
    
    if (!currentEditingImage) return;
    
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
            
            // Upload image immediately
            try {
                const formData = new FormData();
                formData.append('image', newImageFile);
                formData.append('page', currentPage);
                formData.append('imageId', currentEditingImage.id);
                formData.append('title', newTitle);
                formData.append('description', newDescription);
                formData.append('targetFile', currentEditingImage.targetFile);
                formData.append('folder', currentEditingImage.targetFile.split('/').slice(0, -1).join('/'));
                formData.append('filename', currentEditingImage.targetFile.split('/').pop());
                
                const response = await fetch('/api/update-content', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showMessage('Image uploaded successfully!', 'success');
                    
                    // If this is the hero background, refresh the page to show the new background
                    if (currentEditingImage.isHero) {
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    }
                } else {
                    showMessage('Error uploading image: ' + result.message, 'error');
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                showMessage('Error uploading image. Please try again.', 'error');
            }
        }
    
    // Update the image card preview
    updateImageCardPreview(currentEditingImage.id, newTitle, newDescription, newImageFile);
    
    closeImageModal();
    showMessage('Changes saved locally. Click "Save All Changes" to apply to website.', 'success');
}

function updateImageCardPreview(imageId, title, description, imageFile) {
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

// Save Functions
async function saveAllChanges() {
    if (Object.keys(changes).length === 0) {
        showMessage('No changes to save', 'error');
        return;
    }
    
    showMessage('Saving changes...', 'success');
    
    try {
        const changesArray = Object.keys(changes).map(imageId => {
            const change = changes[imageId];
            const content = PAGE_CONTENT[currentPage];
            const image = content.images.find(img => img.id === imageId);
            
            return {
                page: currentPage,
                imageId: imageId,
                title: change.title || image.currentTitle,
                description: change.description || image.currentDescription,
                targetFile: image.targetFile
            };
        });
        
        // Send changes to server
        const response = await fetch('/api/batch-update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ changes: changesArray })
        });
        
        const result = await response.json();
        
        if (result.success) {
            changes = {};
            showMessage('All changes saved successfully!', 'success');
            loadPageContent(currentPage);
        } else {
            showMessage('Error saving changes: ' + result.message, 'error');
        }
        
    } catch (error) {
        console.error('Error saving changes:', error);
        showMessage('Error saving changes. Please try again.', 'error');
    }
}

function applyChangesToWebsite() {
    // This function would apply changes to the actual website files
    // In a real implementation, this would involve server-side processing
    
    Object.keys(changes).forEach(imageId => {
        const change = changes[imageId];
        const content = PAGE_CONTENT[currentPage];
        const image = content.images.find(img => img.id === imageId);
        
        if (image) {
            // Update the image data
            if (change.title) image.currentTitle = change.title;
            if (change.description) image.currentDescription = change.description;
            
            // In a real implementation, you would:
            // 1. Upload the new image file to the server
            // 2. Update the HTML files with new content
            // 3. Update any database or configuration files
        }
    });
}

// Utility Functions
function showMessage(message, type = 'success') {
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

// File upload preview
newImageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close modal
    if (e.key === 'Escape' && !imageModal.classList.contains('hidden')) {
        closeImageModal();
    }
    
    // Ctrl/Cmd + S to save all changes
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveAllChanges();
    }
}); 