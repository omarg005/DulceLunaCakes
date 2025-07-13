// Admin Panel JavaScript

// Configuration
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'dulceluna2025' // Change this to a secure password
};

// Global variables
let currentPage = 'index';
let currentEditingImage = null;
let changes = {};
let PAGE_CONTENT = {};

// Sandbox mode functions
function getSandboxRequests() {
    return JSON.parse(localStorage.getItem('sandboxRequests') || '[]');
}

function updateSandboxRequestStatus(requestId, newStatus) {
    const requests = getSandboxRequests();
    const requestIndex = requests.findIndex(req => req.id === requestId);
    if (requestIndex !== -1) {
        requests[requestIndex].status = newStatus;
        requests[requestIndex].lastUpdated = new Date().toISOString();
        localStorage.setItem('sandboxRequests', JSON.stringify(requests));
        loadRequests(); // Refresh the display
    }
}

function deleteSandboxRequest(requestId) {
    const requests = getSandboxRequests();
    const filteredRequests = requests.filter(req => req.id !== requestId);
    localStorage.setItem('sandboxRequests', JSON.stringify(filteredRequests));
    loadRequests(); // Refresh the display
}

function updateModeIndicator() {
    const modeIndicator = document.getElementById('current-mode');
    if (modeIndicator) {
        // Check if SANDBOX_MODE is defined in the global scope
        const isSandboxMode = typeof window.SANDBOX_MODE !== 'undefined' ? window.SANDBOX_MODE : true;
        modeIndicator.textContent = isSandboxMode ? 'Sandbox Mode' : 'Production Mode';
        modeIndicator.style.backgroundColor = isSandboxMode ? 'var(--accent-mint)' : 'var(--primary-pink)';
        modeIndicator.style.color = isSandboxMode ? 'var(--text-dark)' : 'white';
    }
}

// Load page content from JSON files
async function loadPageContentData() {
    try {
        // Load index page data
        const indexResponse = await fetch('images/index/index_data.json');
        const indexData = await indexResponse.json();
        
        // Load about page data
        const aboutResponse = await fetch('images/about/about_data.json');
        const aboutData = await aboutResponse.json();
        
        // Load gallery data
        const galleryResponse = await fetch('images/gallery/gallery_data.json');
        const galleryData = await galleryResponse.json();
        
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
            loadPageContent(currentPage);
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
    
    // Load page content data first
    loadPageContentData().then(() => {
            // Check if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        console.log('User already logged in');
        showDashboard();
    }
    
    // Update mode indicator
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
    
    // Page tabs
    if (pageTabs && pageTabs.length > 0) {
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
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('Login attempt:', { username, password });
    
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
    const loginScreen = document.getElementById('login-screen');
    const adminDashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    
    loginScreen.classList.remove('hidden');
    adminDashboard.classList.add('hidden');
    loginForm.reset();
    loginError.style.display = 'none';
}

function showDashboard() {
    console.log('showDashboard called');
    const loginScreen = document.getElementById('login-screen');
    const adminDashboard = document.getElementById('admin-dashboard');
    
    console.log('loginScreen:', loginScreen);
    console.log('adminDashboard:', adminDashboard);
    
    if (loginScreen && adminDashboard) {
        loginScreen.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        console.log('Dashboard should now be visible');
        loadPageContent(currentPage);
        updateModeIndicator(); // Update mode indicator when dashboard is shown
    } else {
        console.error('Login screen or admin dashboard not found');
    }
}

function showLoginError(message) {
    const loginError = document.getElementById('login-error');
    loginError.textContent = message;
    loginError.style.display = 'block';
}

// Page Management Functions
function switchPage(page) {
    currentPage = page;
    
    // Update active tab
    const pageTabs = document.querySelectorAll('.page-tab');
    pageTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.page === page);
    });
    
    // Load page content
    loadPageContent(page);
}

function loadPageContent(page) {
    const content = PAGE_CONTENT[page];
    if (!content) return;
    
    const pageTitle = document.getElementById('page-title');
    pageTitle.textContent = content.title;
    
    if (content.isRequestsPage) {
        loadRequests();
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
    const imageTitleInput = document.getElementById('image-title');
    const imageDescriptionInput = document.getElementById('image-description');
    const imageModal = document.getElementById('image-modal');
    
    currentImage.src = image.currentImage;
    imageTitleInput.value = image.currentTitle;
    imageDescriptionInput.value = image.currentDescription;
    
    // Show modal
    imageModal.classList.remove('hidden');
}

function closeImageModal() {
    const imageModal = document.getElementById('image-modal');
    const imageEditForm = document.getElementById('image-edit-form');
    
    imageModal.classList.add('hidden');
    currentEditingImage = null;
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

// Save Functions
function saveAllChanges() {
    console.log('Save all changes called');
    console.log('Current changes:', changes);
    
    if (Object.keys(changes).length === 0) {
        showMessage('No changes to save', 'error');
        return;
    }
    
    showMessage('Saving changes...', 'success');
    
    // Apply changes to the current page content
    Object.keys(changes).forEach(imageId => {
        const change = changes[imageId];
        const content = PAGE_CONTENT[currentPage];
        const image = content.images.find(img => img.id === imageId);
        
        if (image) {
            if (change.title) image.currentTitle = change.title;
            if (change.description) image.currentDescription = change.description;
        }
    });
    
    // Generate comprehensive changes data for Python script
    generateChangesData();
    
    changes = {};
    showMessage('Changes data generated! Download the changes file and run the Python script to apply changes.', 'success');
    loadPageContent(currentPage);
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
function loadRequests() {
    const imageGrid = document.getElementById('image-grid');
    const sandboxRequests = getSandboxRequests();
    
    if (sandboxRequests.length === 0) {
        imageGrid.innerHTML = `
            <div class="no-requests">
                <i class="fas fa-clipboard-list"></i>
                <p>No cake requests found.</p>
                <p>Submit a request through the website to see it appear here (Sandbox Mode).</p>
            </div>
        `;
        return;
    }
    
    // Create requests display
    const requestsHTML = sandboxRequests.map(request => createRequestCard(request)).join('');
    
    imageGrid.innerHTML = `
        <div class="requests-header">
            <h3>Cake Requests (Sandbox Mode)</h3>
            <div class="request-stats">
                <div class="stat-card">
                    <h4>Pending</h4>
                    <span class="stat-number">${sandboxRequests.filter(r => r.status === 'pending').length}</span>
                </div>
                <div class="stat-card">
                    <h4>In Progress</h4>
                    <span class="stat-number">${sandboxRequests.filter(r => r.status === 'in_progress').length}</span>
                </div>
                <div class="stat-card">
                    <h4>Completed</h4>
                    <span class="stat-number">${sandboxRequests.filter(r => r.status === 'completed').length}</span>
                </div>
            </div>
        </div>
        <div class="requests-grid">
            ${requestsHTML}
        </div>
    `;
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
    
    const submittedDate = new Date(request.submittedAt).toLocaleDateString();
    const submittedTime = new Date(request.submittedAt).toLocaleTimeString();
    
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
                    <p><strong>Event Date:</strong> ${request.eventDate || 'Not specified'}</p>
                    <p><strong>Event Type:</strong> ${request.eventType || 'Not specified'}</p>
                    <p><strong>Cake Size:</strong> ${request.cakeSize || 'Not specified'}</p>
                    <p><strong>Flavor:</strong> ${request.flavor || 'Not specified'}</p>
                    <p><strong>Budget:</strong> ${request.budget || 'Not specified'}</p>
                    <p><strong>Submitted:</strong> ${submittedDate} at ${submittedTime}</p>
                </div>
                ${request.description ? `
                    <div class="request-description">
                        <h5>Description:</h5>
                        <p>${request.description}</p>
                    </div>
                ` : ''}
                <div class="request-actions">
                    <select onchange="updateSandboxRequestStatus('${request.id}', this.value)" class="status-select">
                        <option value="pending" ${request.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="in_progress" ${request.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${request.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${request.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                    <button onclick="deleteSandboxRequest('${request.id}')" class="delete-btn">
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