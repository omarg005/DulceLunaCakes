# Dulce Luna Cakes - Admin Panel

A password-protected admin panel for managing images and content across the Dulce Luna Cakes website.

## Features

- 🔐 **Secure Login**: Password-protected access
- 🖼️ **Image Management**: Upload and replace images across all pages
- 📝 **Content Editing**: Update titles and descriptions for each image
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Real-time Updates**: See changes immediately in the interface
- 🔄 **Batch Operations**: Save multiple changes at once

## Setup Instructions

### 1. Install Dependencies

First, install the required Node.js packages:

```bash
npm install
```

This will install:
- `express` - Web server framework
- `multer` - File upload handling
- `cheerio` - HTML parsing and manipulation
- `nodemon` - Development server (dev dependency)

### 2. Start the Admin Server

Run the admin server:

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 3. Access the Admin Panel

Navigate to `http://localhost:3001/admin.html` in your browser.

### 4. Login Credentials

**Default credentials:**
- Username: `admin`
- Password: `dulceluna2025`

**⚠️ Important:** Change these credentials in `admin.js` before deploying to production!

## Usage Guide

### Managing Images

1. **Select a Page**: Choose from Home Page, Gallery, or About
2. **View Images**: See all images on the selected page with their current titles and descriptions
3. **Edit an Image**: Click the "Edit" button on any image card
4. **Upload New Image**: Select a new image file (recommended: 1000x1000px, max 5MB)
5. **Update Content**: Modify the title and description
6. **Save Changes**: Click "Save Changes" to upload the image and update content

### Batch Operations

1. **Make Multiple Changes**: Edit several images across different pages
2. **Save All**: Click "Save All Changes" to apply all modifications at once
3. **Review**: All changes are applied to the actual website files

### Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- AVIF (.avif)

## File Structure

```
DulceLunaCakes/
├── admin.html          # Admin panel interface
├── admin.css           # Admin panel styles
├── admin.js            # Admin panel functionality
├── admin-server.js     # Backend server
├── package.json        # Dependencies
├── images/
│   ├── index/          # Home page images
│   ├── about/          # About page images
│   └── gallery/        # Gallery images
└── [other website files]
```

## Security Considerations

### For Production Use

1. **Change Default Credentials**
   ```javascript
   // In admin.js, update these values:
   const ADMIN_CREDENTIALS = {
       username: 'your-secure-username',
       password: 'your-secure-password'
   };
   ```

2. **Use HTTPS**: Always use HTTPS in production

3. **Environment Variables**: Store credentials in environment variables
   ```javascript
   const ADMIN_CREDENTIALS = {
       username: process.env.ADMIN_USERNAME,
       password: process.env.ADMIN_PASSWORD
   };
   ```

4. **Rate Limiting**: Consider adding rate limiting to prevent brute force attacks

5. **Session Management**: Implement proper session management for production

## API Endpoints

### POST `/api/update-content`
Updates a single image and its content.

**Parameters:**
- `image` (file): New image file
- `page` (string): Page name (index, about, gallery)
- `imageId` (string): Unique image identifier
- `title` (string): New title
- `description` (string): New description
- `targetFile` (string): Target file path
- `folder` (string): Upload folder
- `filename` (string): Target filename

### POST `/api/batch-update`
Updates multiple images and content at once.

**Parameters:**
- `changes` (array): Array of change objects

### GET `/api/health`
Health check endpoint.

## Troubleshooting

### Common Issues

1. **Server Won't Start**
   - Check if port 3001 is available
   - Ensure all dependencies are installed
   - Check Node.js version (requires 14+)

2. **Image Upload Fails**
   - Check file size (max 5MB)
   - Ensure file is an image format
   - Verify folder permissions

3. **Changes Not Applied**
   - Check browser console for errors
   - Verify server is running
   - Check file permissions

4. **Login Issues**
   - Verify credentials in admin.js
   - Clear browser cache
   - Check localStorage in browser dev tools

### Error Messages

- **"Only image files are allowed"**: Upload a valid image file
- **"File too large"**: Reduce image file size
- **"Error updating content"**: Check server logs for details
- **"Invalid username or password"**: Verify login credentials

## Development

### Adding New Pages

1. Update `PAGE_CONTENT` in `admin.js`
2. Add page tab in `admin.html`
3. Update `updateHtmlContent()` in `admin-server.js`

### Adding New Images

1. Add image configuration to `PAGE_CONTENT`
2. Update HTML selectors in `updateHtmlContent()`
3. Add image to appropriate folder

### Customizing Styles

Edit `admin.css` to match your brand colors and styling preferences.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Check server logs for backend issues
4. Verify file permissions and paths

## License

This admin panel is part of the Dulce Luna Cakes website project. 