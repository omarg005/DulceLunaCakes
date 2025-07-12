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
    },
    requests: {
        title: 'Review Cake Requests',
        isRequestsPage: true
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

// Modal elements for status update
const statusModal = document.getElementById('status-modal');
const closeStatusModalBtn = document.getElementById('close-status-modal');
const statusUpdateForm = document.getElementById('status-update-form');
const statusSelect = document.getElementById('status-select');
const statusNotes = document.getElementById('status-notes');
const cancelStatusUpdateBtn = document.getElementById('cancel-status-update');
let currentStatusSubmissionId = null;

function openStatusModal(submissionId, currentStatus = 'pending', currentNotes = '') {
    currentStatusSubmissionId = submissionId;
    statusSelect.value = currentStatus;
    statusNotes.value = currentNotes || '';
    statusModal.classList.remove('hidden');
}

function closeStatusModal() {
    currentStatusSubmissionId = null;
    statusModal.classList.add('hidden');
}

closeStatusModalBtn.addEventListener('click', closeStatusModal);
cancelStatusUpdateBtn.addEventListener('click', closeStatusModal);

statusUpdateForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const status = statusSelect.value;
    const notes = statusNotes.value;
    if (!currentStatusSubmissionId) return;
    try {
        const response = await fetch(`http://localhost:3002/api/submissions/${currentStatusSubmissionId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status, notes })
        });
        const result = await response.json();
        if (result.success) {
            showMessage('Request status updated successfully!', 'success');
            loadRequests();
        } else {
            showMessage('Error updating status: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showMessage('Error updating status. Please try again.', 'error');
    }
    closeStatusModal();
});

// Modal elements for request details
const detailsModal = document.getElementById('details-modal');
const closeDetailsModalBtn = document.getElementById('close-details-modal');
const detailsModalBody = document.getElementById('details-modal-body');

function openDetailsModal(submission) {
    // Build the details HTML
    detailsModalBody.innerHTML = `
        <div class="details-section">
            <h4>Contact Information</h4>
            <p><strong>Name:</strong> ${submission.name}</p>
            <p><strong>Email:</strong> ${submission.email}</p>
            <p><strong>Phone:</strong> ${submission.phone}</p>
        </div>
        <div class="details-section">
            <h4>Event Details</h4>
            <p><strong>Date Needed:</strong> ${submission['date-needed']}</p>
            <p><strong>Event Type:</strong> ${submission['event-type'] || 'Not specified'}</p>
            <p><strong>Event Address:</strong> ${submission['event-address'] || 'Not specified'}</p>
            <p><strong>City:</strong> ${submission['event-city'] || 'Not specified'}</p>
            <p><strong>Zip Code:</strong> ${submission['event-zip'] || 'Not specified'}</p>
        </div>
        <div class="details-section">
            <h4>Cake Specifications</h4>
            <p><strong>Size:</strong> ${submission['cake-size']}</p>
            <p><strong>Flavor:</strong> ${submission['cake-flavor']}</p>
            <p><strong>Frosting:</strong> ${submission['frosting-type'] || 'Not specified'}</p>
        </div>
        <div class="details-section">
            <h4>Design Details</h4>
            <p><strong>Description:</strong> ${submission['design-description']}</p>
            <p><strong>Color Scheme:</strong> ${submission['color-scheme'] || 'Not specified'}</p>
            <p><strong>Special Requests:</strong> ${submission['special-requests'] || 'None'}</p>
            <p><strong>Inspiration Links:</strong> ${submission['inspiration-links'] || 'None'}</p>
        </div>
        <div class="details-section">
            <h4>Status & Notes</h4>
            <p><strong>Status:</strong> ${getStatusText(submission.status)}</p>
            <p><strong>Admin Notes:</strong> ${submission.adminNotes || 'None'}</p>
        </div>
        <div class="details-section">
            <h4>Submitted</h4>
            <p>${new Date(submission.timestamp).toLocaleString()}</p>
        </div>
        ${submission.referenceImage ? `<div class="details-section"><h4>Reference Image</h4><img src="${submission.referenceImage}" alt="Reference" class="reference-image"></div>` : ''}
    `;
    detailsModal.classList.remove('hidden');
}

function closeDetailsModal() {
    detailsModal.classList.add('hidden');
    detailsModalBody.innerHTML = '';
}

closeDetailsModalBtn.addEventListener('click', closeDetailsModal);

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel loaded');
    
    // Debug: Check if elements exist
    console.log('Login form:', loginForm);
    console.log('Admin dashboard:', adminDashboard);
    console.log('Image grid:', imageGrid);
    
    // Check if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        console.log('User already logged in');
        showDashboard();
    }
    
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
    
    // Page tabs
    if (pageTabs.length > 0) {
        pageTabs.forEach(tab => {
            tab.addEventListener('click', () => switchPage(tab.dataset.page));
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
    
    if (content.isRequestsPage) {
        loadRequests();
    } else {
        renderImageGrid(content.images);
    }
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
    console.log('Save all changes called');
    console.log('Current changes:', changes);
    
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
        
        console.log('Sending changes to server:', changesArray);
        
        // Send changes to server
        const response = await fetch('/api/batch-update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ changes: changesArray })
        });
        
        console.log('Server response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Server response:', result);
        
        if (result.success) {
            changes = {};
            showMessage('All changes saved successfully!', 'success');
            loadPageContent(currentPage);
        } else {
            showMessage('Error saving changes: ' + result.message, 'error');
        }
        
    } catch (error) {
        console.error('Error saving changes:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            type: error.constructor.name
        });
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

// Requests Management Functions
async function loadRequests() {
    try {
        const response = await fetch('http://localhost:3002/api/submissions');
        const result = await response.json();
        
        if (result.success) {
            renderRequestsGrid(result.submissions);
            window.requestsData = result.submissions; // Store for status update
        } else {
            showMessage('Error loading requests: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error loading requests:', error);
        showMessage('Error loading requests. Please check if the form server is running.', 'error');
    }
}

function renderRequestsGrid(submissions) {
    imageGrid.innerHTML = '';
    
    if (submissions.length === 0) {
        imageGrid.innerHTML = '<div class="no-requests"><p>No cake requests found.</p></div>';
        return;
    }
    
    submissions.forEach(submission => {
        const requestCard = createRequestCard(submission);
        imageGrid.appendChild(requestCard);
    });
}

function createRequestCard(submission) {
    const card = document.createElement('div');
    card.className = 'request-card';
    
    const statusClass = getStatusClass(submission.status);
    const statusText = getStatusText(submission.status);
    
    card.innerHTML = `
        <div class="request-card-header">
            <h4>Request #${submission.id} - ${submission.name}</h4>
            <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="request-card-content">
            <div class="request-info">
                <p><strong>Date Needed:</strong> ${submission['date-needed']}</p>
                <p><strong>Cake Size:</strong> ${submission['cake-size']}</p>
                <p><strong>Cake Flavor:</strong> ${submission['cake-flavor']}</p>
                <p><strong>Event Type:</strong> ${submission['event-type'] || 'Not specified'}</p>
                <p><strong>Budget:</strong> ${submission['budget-range'] || 'Not specified'}</p>
                <p><strong>Submitted:</strong> ${new Date(submission.timestamp).toLocaleString()}</p>
            </div>
            
            <div class="request-details">
                <h5>Contact Information</h5>
                <p><strong>Email:</strong> ${submission.email}</p>
                <p><strong>Phone:</strong> ${submission.phone}</p>
                
                <h5>Design Description</h5>
                <p>${submission['design-description']}</p>
                
                ${submission['special-requests'] ? `
                    <h5>Special Requests</h5>
                    <p>${submission['special-requests']}</p>
                ` : ''}
                
                ${submission.referenceImage ? `
                    <h5>Reference Image</h5>
                    <img src="${submission.referenceImage}" alt="Reference" class="reference-image">
                ` : ''}
            </div>
            
            <div class="request-actions">
                <button class="action-button view-button" onclick="viewRequest(${submission.id})">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="action-button status-button" onclick="updateRequestStatus(${submission.id})">
                    <i class="fas fa-edit"></i> Update Status
                </button>
                <button class="action-button delete-button" onclick="deleteRequest(${submission.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function getStatusClass(status) {
    switch (status) {
        case 'pending': return 'status-pending';
        case 'reviewed': return 'status-reviewed';
        case 'approved': return 'status-approved';
        case 'in-progress': return 'status-progress';
        case 'completed': return 'status-completed';
        case 'cancelled': return 'status-cancelled';
        default: return 'status-pending';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'pending': return 'Pending';
        case 'reviewed': return 'Reviewed';
        case 'approved': return 'Approved';
        case 'in-progress': return 'In Progress';
        case 'completed': return 'Completed';
        case 'cancelled': return 'Cancelled';
        default: return 'Pending';
    }
}

async function updateRequestStatus(submissionId) {
    // Find the submission to get current status/notes (optional, for better UX)
    let submission = null;
    if (window.requestsData && Array.isArray(window.requestsData)) {
        submission = window.requestsData.find(s => s.id === submissionId);
    }
    openStatusModal(submissionId, submission ? submission.status : 'pending', submission ? (submission.adminNotes || '') : '');
}

async function deleteRequest(submissionId) {
    if (!confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3002/api/submissions/${submissionId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Request deleted successfully!', 'success');
            loadRequests(); // Reload the requests
        } else {
            showMessage('Error deleting request: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting request:', error);
        showMessage('Error deleting request. Please try again.', 'error');
    }
}

function viewRequest(submissionId) {
    let submission = null;
    if (window.requestsData && Array.isArray(window.requestsData)) {
        submission = window.requestsData.find(s => s.id === submissionId);
    }
    if (submission) {
        openDetailsModal(submission);
    } else {
        alert('Request details not found.');
    }
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